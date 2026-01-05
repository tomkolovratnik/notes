# Multi-Agent orchestrace: 10+ Claude instancí paralelně (Part 3)

_Autor: bredmond1019 | Zdroj: DEV Community_

---


Last Tuesday at 3 AM, I watched 12 Claude agents rebuild my entire frontend while I slept. One agent refactored components, another wrote tests, a third updated documentation, and a fourth optimized performance.

By morning, I had a pull request with 10,000+ lines of perfectly coordinated changes.

This isn't science fiction. This is multi-agent orchestration with Claude Code, and it's changing how we build software at scale.

The Multi-Agent Revolution

In Parts 1 and 2, we explored Claude's capabilities and hook system. Now, let's tackle the ultimate productivity multiplier: running multiple Claude instances in parallel.

But first, a warning: **This is where things get complex**. Multiple agents mean:

- Resource contention
- File conflicts
- Coordination challenges
- Observability nightmares

Get it wrong, and you'll have chaos. Get it right, and you'll achieve superhuman productivity.

The Architecture That Makes It Possible

Here's the system architecture I use for multi-agent orchestration:

```
┌─────────────────────────────────────────────┐
│            Orchestrator (Meta-Agent)         │
│         Decides what needs to be done        │
└──────────────────┬──────────────────────────┘
│ Creates tasks
▼
┌─────────────────────────────────────────────┐
│              Task Queue (Redis)              │
│         Stores and distributes work          │
└─────┬───────┬───────┬───────┬──────────────┘
│       │       │       │
▼       ▼       ▼       ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Agent 1 │ │ Agent 2 │ │ Agent 3 │ │ Agent N │
│Frontend │ │ Backend │ │  Tests  │ │  Docs   │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
│       │       │       │
└───────┴───────┴───────┘
│
▼
┌──────────────────┐
│  Observability   │
│    Dashboard     │
└──────────────────┘

```

Step 1: The Meta-Agent Orchestrator

The meta-agent is Claude running in a special mode where it doesn't write code - it manages other agents:

```
# orchestrator.py
import json
import redis
import subprocess
from typing import List, Dict

class MetaAgent:
def __init__(self):
self.redis = redis.Redis(host='localhost', port=6379, db=0)
self.task_queue = 'claude_tasks'

def analyze_project(self, requirements: str) -> List[Dict]:
"""Use Claude to break down requirements into parallel tasks"""

prompt = f"""
Analyze these requirements and break them into independent tasks
that can be executed in parallel by specialized agents:

{requirements}

Return a JSON array of tasks with:
- id: unique identifier
- type: frontend|backend|testing|docs|refactor
- description: what needs to be done
- dependencies: array of task IDs that must complete first
- files: array of files this task will modify
"""

# Call Claude API
response = self.call_claude(prompt)
return json.loads(response)

def distribute_tasks(self, tasks: List[Dict]):
"""Queue tasks for worker agents"""

# Sort by dependencies
sorted_tasks = self.topological_sort(tasks)

for task in sorted_tasks:
# Check dependencies
if self.dependencies_complete(task):
self.redis.lpush(self.task_queue, json.dumps(task))
else:
# Queue for later
self.redis.lpush(f"{self.task_queue}:pending", json.dumps(task))

def spawn_worker_agents(self, count: int):
"""Launch Claude worker agents"""

for i in range(count):
subprocess.Popen([
'claude-code',
'--mode', 'worker',
'--id', f'agent-{i}',
'--config', 'worker-config.json'
])

```

Step 2: Specialized Worker Agents

Each worker agent has a specific role and configuration:

```
# worker_agent.py
import os
import json
import redis
import time

class WorkerAgent:
def __init__(self, agent_id: str, specialization: str):
self.id = agent_id
self.specialization = specialization
self.redis = redis.Redis(host='localhost', port=6379, db=0)

def run(self):
"""Main worker loop"""

while True:
# Get task from queue
task_data = self.redis.brpop('claude_tasks', timeout=5)

if task_data:
task = json.loads(task_data[1])

# Check if this agent can handle the task
if self.can_handle(task):
self.execute_task(task)
else:
# Put it back for another agent
self.redis.lpush('claude_tasks', task_data[1])
time.sleep(1)

def execute_task(self, task: Dict):
"""Execute a task with Claude"""

# Acquire file locks
locked_files = self.acquire_locks(task['files'])

try:
# Set up Claude context
prompt = self.build_prompt(task)

# Execute with Claude
os.environ['CLAUDE_SESSION_ID'] = f"{self.id}-{task['id']}"
result = self.run_claude(prompt)

# Report completion
self.redis.hset(f"task:{task['id']}", 'status', 'complete')
self.redis.hset(f"task:{task['id']}", 'result', result)

# Trigger dependent tasks
self.trigger_dependencies(task['id'])

finally:
# Release locks
self.release_locks(locked_files)

def acquire_locks(self, files: List[str]) -> List[str]:
"""Acquire exclusive locks on files"""

locked = []
for file_path in files:
lock_key = f"lock:{file_path}"

# Try to acquire lock with timeout
if self.redis.set(lock_key, self.id, nx=True, ex=300):
locked.append(file_path)
else:
# Couldn't get lock, release all and retry
self.release_locks(locked)
time.sleep(2)
return self.acquire_locks(files)

return locked

```

Step 3: Real-Time Observability

With multiple agents running, observability becomes critical. Here's my monitoring dashboard:

```
<!DOCTYPE html>
<html>
<head>
<title>Claude Multi-Agent Command Center</title>
<script src="https://cdn.jsdelivr.net/npm/vue@3"></script>
<style>
.agent-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
gap: 20px;
padding: 20px;
}
.agent-card {
border: 2px solid #3498db;
border-radius: 8px;
padding: 15px;
position: relative;
}
.agent-card.active {
border-color: #2ecc71;
box-shadow: 0 0 10px rgba(46, 204, 113, 0.3);
}
.agent-status {
position: absolute;
top: 10px;
right: 10px;
width: 12px;
height: 12px;
border-radius: 50%;
background: #95a5a6;
}
.agent-status.active { background: #2ecc71; }
.agent-status.busy { background: #f39c12; }
.agent-status.error { background: #e74c3c; }

.task-progress {
margin-top: 10px;
height: 20px;
background: #ecf0f1;
border-radius: 10px;
overflow: hidden;
}
.task-progress-bar {
height: 100%;
background: linear-gradient(90deg, #3498db, #2ecc71);
transition: width 0.3s;
}

.conflict-alert {
background: #e74c3c;
color: white;
padding: 10px;
border-radius: 5px;
margin: 10px;
}
</style>
</head>
<body>
<div id="app">
<h1>Claude Multi-Agent Command Center</h1>

<!-- Overall Stats -->
<div class="stats">
<h2>Mission Status</h2>
<p>Active Agents: {{ activeAgents.length }}</p>
<p>Tasks Completed: {{ completedTasks }} / {{ totalTasks }}</p>
<p>Files Modified: {{ modifiedFiles.size }}</p>
<p>Conflicts Detected: {{ conflicts.length }}</p>
</div>

<!-- Conflict Alerts -->
<div v-if="conflicts.length > 0" class="conflict-alert">
⚠️ File Conflicts Detected:
<ul>
<li v-for="conflict in conflicts" :key="conflict.file">
{{ conflict.file }} - {{ conflict.agents.join(' vs ') }}
</li>
</ul>
</div>

<!-- Agent Grid -->
<div class="agent-grid">
<div v-for="agent in agents" 
:key="agent.id" 
:class="['agent-card', { active: agent.status === 'active' }]">

<div :class="['agent-status', agent.status]"></div>

<h3>{{ agent.id }}</h3>
<p>Type: {{ agent.specialization }}</p>
<p>Current Task: {{ agent.currentTask || 'Idle' }}</p>

<div v-if="agent.currentTask" class="task-progress">
<div class="task-progress-bar" 
:style="{ width: agent.progress + '%' }"></div>
</div>

<p>Files: {{ agent.workingFiles.join(', ') || 'None' }}</p>
<p>Tasks Completed: {{ agent.completedCount }}</p>
</div>
</div>

<!-- Activity Stream -->
<div class="activity-stream">
<h2>Live Activity</h2>
<div v-for="event in recentEvents" :key="event.id" class="event">
<span class="timestamp">{{ formatTime(event.timestamp) }}</span>
<span class="agent">{{ event.agentId }}:</span>
<span class="action">{{ event.action }}</span>
</div>
</div>
</div>

<script>
const { createApp } = Vue;

createApp({
data() {
return {
agents: [],
conflicts: [],
recentEvents: [],
totalTasks: 0,
completedTasks: 0,
modifiedFiles: new Set(),
ws: null
};
},

computed: {
activeAgents() {
return this.agents.filter(a => a.status === 'active');
}
},

methods: {
connect() {
this.ws = new WebSocket('ws://localhost:3001/agents');

this.ws.onmessage = (event) => {
const data = JSON.parse(event.data);

switch(data.type) {
case 'agent_update':
this.updateAgent(data.agent);
break;
case 'conflict':
this.conflicts.push(data.conflict);
break;
case 'task_complete':
this.completedTasks++;
break;
case 'event':
this.recentEvents.unshift(data.event);
this.recentEvents = this.recentEvents.slice(0, 50);
break;
}
};
},

updateAgent(agentData) {
const index = this.agents.findIndex(a => a.id === agentData.id);
if (index >= 0) {
this.agents[index] = agentData;
} else {
this.agents.push(agentData);
}

// Track modified files
if (agentData.workingFiles) {
agentData.workingFiles.forEach(f => this.modifiedFiles.add(f));
}
},

formatTime(timestamp) {
return new Date(timestamp).toLocaleTimeString();
}
},

mounted() {
this.connect();
}
}).mount('#app');
</script>
</body>
</html>

```

Real-World Example: The Frontend Refactor

Last week, I needed to refactor my entire component library from class components to functional components with hooks. Here's how multi-agent orchestration handled it:

The Meta-Agent's Plan:

```
[
{
"id": "analyze-1",
"type": "analysis",
"description": "Scan all components and create refactoring plan",
"dependencies": [],
"files": []
},
{
"id": "refactor-buttons",
"type": "frontend",
"description": "Convert all Button components to functional",
"dependencies": ["analyze-1"],
"files": ["components/Button/*.tsx"]
},
{
"id": "refactor-forms",
"type": "frontend", 
"description": "Convert all Form components to functional",
"dependencies": ["analyze-1"],
"files": ["components/Form/*.tsx"]
},
{
"id": "update-tests-buttons",
"type": "testing",
"description": "Update Button component tests",
"dependencies": ["refactor-buttons"],
"files": ["__tests__/Button/*.test.tsx"]
},
{
"id": "update-tests-forms",
"type": "testing",
"description": "Update Form component tests",
"dependencies": ["refactor-forms"],
"files": ["__tests__/Form/*.test.tsx"]
},
{
"id": "update-docs",
"type": "docs",
"description": "Update component documentation",
"dependencies": ["refactor-buttons", "refactor-forms"],
"files": ["docs/components/*.md"]
}
]

```

The Execution:

- 
**Agent-1** and **Agent-2** worked on different component folders in parallel
- 
**Agent-3** and **Agent-4** updated tests as components were completed
- 
**Agent-5** regenerated documentation after all refactoring was done
- 
**Agent-6** ran performance benchmarks on the new components

**Total time**: 2 hours (vs estimated 2 days manual work)

**Lines changed**: 12,000+

**Tests passing**: 100%

**Conflicts**: 0

Handling the Complexity

Challenge 1: Resource Management

Running 10+ Claude instances will max out your system. Here's my resource manager:

```
# resource_manager.py
import psutil
import docker

class ResourceManager:
def __init__(self, max_agents=10):
self.max_agents = max_agents
self.docker = docker.from_env()

def can_spawn_agent(self) -> bool:
# Check CPU usage
if psutil.cpu_percent(interval=1) > 80:
return False

# Check memory
if psutil.virtual_memory().percent > 85:
return False

# Check active containers
active = len([c for c in self.docker.containers.list() 
if 'claude-agent' in c.name])

return active < self.max_agents

def spawn_agent_container(self, agent_config):
"""Spawn agent in Docker container for isolation"""

container = self.docker.containers.run(
'claude-agent:latest',
environment=agent_config,
detach=True,
name=f"claude-agent-{agent_config['id']}",
volumes={
'/project': {'bind': '/workspace', 'mode': 'rw'}
},
cpu_quota=50000,  # Limit CPU usage
mem_limit='2g'     # Limit memory
)

return container

```

Challenge 2: Coordination Without Conflicts

The key is smart task distribution and file locking:

```
# conflict_prevention.py
class ConflictPrevention:
def __init__(self):
self.file_graph = self.build_dependency_graph()

def build_dependency_graph(self):
"""Map file dependencies to prevent conflicts"""

# Analyze imports and exports
graph = {}
for file in glob.glob('**/*.ts', recursive=True):
imports = self.extract_imports(file)
graph[file] = imports

return graph

def can_modify_simultaneously(self, file1: str, file2: str) -> bool:
"""Check if two files can be modified in parallel"""

# Check if files import each other
if file2 in self.file_graph.get(file1, []):
return False
if file1 in self.file_graph.get(file2, []):
return False

# Check if they share common dependencies
deps1 = set(self.file_graph.get(file1, []))
deps2 = set(self.file_graph.get(file2, []))

shared = deps1.intersection(deps2)

# Allow if no shared critical dependencies
return len(shared) == 0 or all(
not self.is_critical(dep) for dep in shared
)

```

Challenge 3: Quality Control

With multiple agents, quality control becomes critical:

```
# quality_gate.py
class QualityGate:
def __init__(self):
self.checks = [
self.check_tests_pass,
self.check_type_safety,
self.check_no_conflicts,
self.check_performance,
self.check_security
]

def validate_agent_work(self, agent_id: str, changes: Dict):
"""Validate agent's changes before merging"""

results = []
for check in self.checks:
result = check(changes)
results.append(result)

if not result['passed']:
# Revert changes and reassign task
self.revert_changes(changes)
self.reassign_task(agent_id, result['reason'])
return False

return True

def check_tests_pass(self, changes):
"""Run tests on changed files"""

affected_tests = self.find_affected_tests(changes['files'])

result = subprocess.run(
['npm', 'test'] + affected_tests,
capture_output=True
)

return {
'passed': result.returncode == 0,
'reason': result.stderr.decode() if result.returncode != 0 else None
}

```

The Economics of Multi-Agent Development

Let's talk ROI. Running 10 Claude agents costs approximately:

- 
**API costs**: ~$50/day at heavy usage
- 
**Infrastructure**: ~$20/day for cloud resources

But the productivity gains:

- 
**10x faster development** on parallelizable tasks
- 
**24/7 operation** (agents don't sleep)
- 
**Consistent quality** (no fatigue)
- 
**Comprehensive testing** (every change, every time)

For a team of 5 developers, this replaces roughly $50,000/month in engineering time for $2,000/month in compute costs.

Getting Started with Multi-Agent

Start small:

- 
**Two agents**: One for code, one for tests
- 
**Add observability**: You need to see what's happening
- 
**Implement safety**: File locks and conflict detection
- 
**Scale gradually**: Add agents as you understand the patterns

The Future is Distributed

We're entering an era where a single developer can orchestrate an entire team of AI agents. The bottleneck isn't coding speed anymore - it's our ability to coordinate and direct these agents effectively.

Next week, I'm experimenting with 50+ agents working on a complete application rewrite. The meta-agent will manage sub-orchestrators, each controlling their own team of specialized agents.

It's turtles all the way down, and it's beautiful.

🚀 Take Your AI Engineering to the Next Level

**🌐 Visit learn-agentic-ai.com - Your Hub for Advanced AI Development**

**🎓 Complete Learning Paths:**

- 🎯 Claude Code Mastery - 7 modules from basics to multi-agent orchestration
- 🔧 AI Engineering Fundamentals - Build unstoppable foundations
- 🏗️ Production AI Systems - Enterprise-ready patterns and practices

**📚 Essential Reading for Multi-Agent Systems:**

- 
Multi-Agent Observability: Complete Implementation Guide - See everything your agents do
- 
Self-Building AI: Meta-Agents and Sub-Agent Architecture - Advanced orchestration patterns
- 
Why Multi-Agent Systems Are a Trap (And How to Avoid It) - Critical lessons learned
- 
Agent Architecture Patterns: Production Guide - Battle-tested patterns
- 
Building AI Agents with Pure Python - No framework required
- 
12-Factor Agents: Building Reliable LLM Applications - Production best practices

**💡 Business & ROI Resources:**

- 
ROI-Driven AI: Measuring and Maximizing Returns - Prove the value
- 
The CAIR Metric: Hidden Key to AI Product Success - Measure what matters
- 
POC to Production: Lessons from 200+ Enterprise Deployments - Real-world insights

**🛠️ Tools & Templates:**

- 
GitHub: Multi-Agent Orchestration Templates - Production-ready code
- 
Free Weekly Newsletter - Latest techniques and case studies

**About the Author:**

I'm Brandon J. Redmond, AI Engineer & Agentic Systems Architect. I've built and deployed multi-agent systems processing millions of requests. Let's connect on LinkedIn or explore more at learn-agentic-ai.com.

Have you experimented with multiple AI agents? What challenges did you face? Let's discuss in the comments!

**Previous Articles in This Series:**

- Part 1: The Claude Code Revolution
- Part 2: Mastering Claude Hooks

**Ready to build your own agent swarm?** Start with the Claude Code Mastery learning path - from zero to orchestrating multiple agents in 7 comprehensive modules.

Mastering Claude Code (3 Part Series)

1
The Claude Code Revolution: How AI Transformed Software Engineering (Part 1)

2
Mastering Claude Hooks: Building Observable AI Systems (Part 2)

3
Multi-Agent Orchestration: Running 10+ Claude Instances in Parallel (Part 3)

Top comments (0)

Subscribe

Personal
Trusted User

Create template

Templates let you quickly answer FAQs or store snippets for re-use.

Submit
Preview
Dismiss

Code of Conduct
•
Report abuse

Are you sure you want to hide this comment? It will become hidden in your post, but will still be visible via the comment's permalink.

Hide child comments as well

Confirm

For further actions, you may consider blocking this person and/or reporting abuse

.long-bb-body {
max-height: calc(100vh - 200px);
overflow: hidden;
}
.long-bb-bottom {
height: 180px;
background: linear-gradient(to top, var(--card-bg), transparent);
margin-top: -180px;
position:relative;
z-index: 5;
}

Bright Data

Promoted

Dropdown menu

- 

What's a billboard?

- 

Manage preferences

- 

Report billboard

## Building a Multi-Agent AI Brand Monitoring System with n8n and Bright Data

Check out this submission for the AI Agents Challenge powered by n8n and Bright Data.

Read more →

bredmond1019

Follow

Former teacher → self-taught developer → team lead. Now building AI tools in Rust & Python. When not coding: dad, piano, rock climbing, gaming, walking my dog, crafting questionable dad jokes. 🧗‍♂️

- 

Location

Sao Paulo, Brazil

- 

Education

Master's in Mathematics

- 

Work

Taught High school Comp Sci & Math for 5 years

- 

Joined

23. 11. 2019

More from bredmond1019

Mastering Claude Hooks: Building Observable AI Systems (Part 2)

#ai
#automation
#observability
#claude

The Claude Code Revolution: How AI Transformed Software Engineering (Part 1)

#ai
#programming
#productivity
#claude

Building Intelligent AI Agents with Memory: A Complete Guide

#ai
#agents
#mongodb
#architecture

.long-bb-body {
max-height: calc(100vh - 200px);
overflow: hidden;
}
.long-bb-bottom {
height: 180px;
background: linear-gradient(to top, var(--card-bg), transparent);
margin-top: -180px;
position:relative;
z-index: 5;
}

Spacelift

Promoted

Dropdown menu

- 

What's a billboard?

- 

Manage preferences

- 

Report billboard

## IaCConf Spotlight: AI in IaC

Hear from engineers how they’re applying AI to infrastructure safely and pragmatically, from AI-assisted IaC to improving module adoption and team workflows.

Register Now

function activateRunkitTags() {
if (!areAnyRunkitTagsPresent())
return

var checkRunkit = setInterval(function() {
try {
dynamicallyLoadRunkitLibrary()

if (typeof(RunKit) === 'undefined') {
return
}

replaceTagContentsWithRunkitWidget()
clearInterval(checkRunkit);
} catch(e) {
console.error(e);
clearInterval(checkRunkit);
}
}, 200);
}

function isRunkitTagAlreadyActive(runkitTag) {
return runkitTag.querySelector("iframe") !== null;
};

function areAnyRunkitTagsPresent() {
var presentRunkitTags = document.getElementsByClassName("runkit-element");

return presentRunkitTags.length > 0
}

function replaceTagContentsWithRunkitWidget() {
var targets = document.getElementsByClassName("runkit-element");
for (var i = 0; i < targets.length; i++) {
if (isRunkitTagAlreadyActive(targets[i])) {
continue;
}

var wrapperContent = targets[i].textContent;
if (/^(<iframe src)/.test(wrapperContent) === false) {
if (targets[i].children.length > 0) {
var preamble = targets[i].children[0].textContent;
var content = targets[i].children[1].textContent;
targets[i].innerHTML = "";
var notebook = RunKit.createNotebook({
element: targets[i],
source: content,
preamble: preamble
});
}
}
}
};

function dynamicallyLoadRunkitLibrary() {
if (typeof(dynamicallyLoadScript) === "undefined")
return

dynamicallyLoadScript("//embed.runkit.com")
}

activateRunkitTags();

.long-bb-body {
max-height: calc(100vh - 200px);
overflow: hidden;
}
.long-bb-bottom {
height: 180px;
background: linear-gradient(to top, var(--card-bg), transparent);
margin-top: -180px;
position:relative;
z-index: 5;
}

👋 Kindness is contagious

Dropdown menu

- 

What's a billboard?

- 

Manage preferences

- 

Report billboard

Discover fresh viewpoints in this insightful post, supported by our vibrant DEV Community. **Every developer’s experience matters**—add your thoughts and help us grow together.

A simple “thank you” can uplift the author and spark new discussions—leave yours below!

On DEV, **knowledge-sharing connects us and drives innovation**. Found this useful? A quick note of appreciation makes a real impact.

## Okay

.long-bb-body {
max-height: calc(100vh - 200px);
overflow: hidden;
}
.long-bb-bottom {
height: 180px;
background: linear-gradient(to top, var(--card-bg), transparent);
margin-top: -180px;
position:relative;
z-index: 5;
}

💎 DEV Diamond Sponsors

Thank you to our Diamond Sponsors for supporting the DEV Community

Google AI is the official AI Model and Platform Partner of DEV

Neon is the official database partner of DEV

Algolia is the official search partner of DEV

DEV Community — A space to discuss and keep up software development and manage your software career

- 

Home

- 

DEV++

- 

Reading List

- 

Podcasts

- 

Videos

- 

DEV Education Tracks

- 

DEV Challenges

- 

DEV Help

- 

Advertise on DEV

- 

DEV Showcase

- 

About

- 

Contact

- 

Free Postgres Database

- 

Software comparisons

- 

Forem Shop

- 

Code of Conduct

- 

Privacy Policy

- 

Terms of Use

Built on Forem — the open source software that powers DEV and other inclusive communities.

Made with love and Ruby on Rails. DEV Community © 2016 - 2026.

We're a place where coders share, stay up-to-date and grow their careers.

Log in

Create account

var userSignedIn = false;
if (document.readyState === 'complete' || document.readyState === 'interactive') {
initAuth();
} else {
document.addEventListener('DOMContentLoaded', initAuth);
}

function initAuth() {
var paramToken = new URLSearchParams(window.location.search).get('jwt');

if (paramToken && !userSignedIn) {
authenticateUser(paramToken);
} else {
var iframe = document.createElement('iframe');
iframe.style.display = 'none';
iframe.src = 'https://forem.com/auth_pass/iframe';

document.body.appendChild(iframe);

window.addEventListener('message', function(event) {
if (event.origin !== 'https://forem.com' && event.origin !== window.location.origin) {
return;
}

var data = event.data;

if (data.authenticated && !userSignedIn) {
authenticateUser(data.token);
} else if(data.authenticated && window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
window.ReactNativeWebView.postMessage(JSON.stringify({
action: 'login',
token: data.token,
}));
}
});  
}

function authenticateUser(token) {
fetch('/auth_pass/token_login', {
method: 'POST',
credentials: 'include',
headers: {
'Content-Type': 'application/json',
'X-CSRF-Token': getMetaContent('csrf-token'),
},
body: JSON.stringify({ token: token }),
})
.then(function(response) {
return response.json();
})
.then(function(data) {
if (data.success) {
if (document.head.querySelector('meta[name="user-signed-in"][content="false"]')) {
// Reload the page to update the user's state
location.reload();
}
}
})
.catch(function(error) {
console.error('Error during authentication:', error);
});
}

function getMetaContent(name) {
var element = document.querySelector('meta[name="' + name + '"]');
return element ? element.getAttribute('content') : '';
}
}

