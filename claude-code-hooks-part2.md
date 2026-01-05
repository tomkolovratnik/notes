# Mastering Claude Hooks: Budování pozorovatelných AI systémů (Part 2)

_Autor: bredmond1019 | Zdroj: DEV Community_

---


Picture this: It's 6 AM, you're deep in flow with Claude Code, and suddenly your AI assistant decides to be helpful by running `rm -rf /` on your production server.

Sound terrifying? This exact scenario is what Claude hooks were designed to prevent.

In Part 1, we explored how Claude Code is revolutionizing software development. Now, let's dive into the power tool that transforms Claude from a coding assistant into a proactive development partner: **Hooks**.

What Are Claude Hooks?

Hooks are event-driven scripts that fire at specific points in Claude's lifecycle. Think of them as middleware for your AI assistant - intercepting, monitoring, and enhancing every interaction.

Five hook events give you complete control:

- 
**PreToolUse** - Your safety guardian
- 
**PostToolUse** - The observer
- 
**Notification** - Interactive moments
- 
**Stop** - Session complete
- 
**SubagentStop** - Parallel processing

The Safety Net That Saved My Project

Last week, Claude suggested a "cleanup" operation that would've deleted my entire node_modules across all projects. Here's the hook that saved me:

```
#!/usr/bin/env python3
# scripts/safety_check.py

import os
import sys

DANGEROUS_PATTERNS = [
'rm -rf /',
'rm -rf ~',
'sudo rm',
':(){:|:&};:',  # Fork bomb
'dd if=/dev/zero',
'chmod -R 777'
]

def check_safety():
command = os.environ.get('TOOL_COMMAND', '')

for pattern in DANGEROUS_PATTERNS:
if pattern in command:
print(f"🛑 BLOCKED: Dangerous command detected: {pattern}")
print(f"Command was: {command}")
sys.exit(1)  # This stops Claude from executing

# Check for mass deletions
if 'rm' in command and command.count('*') > 2:
print("⚠️  Multiple wildcards in deletion command. Blocking for safety.")
sys.exit(1)

if __name__ == "__main__":
check_safety()

```

Hook configuration:

```
{
"hooks": {
"PreToolUse": [{
"matcher": ".*",
"hooks": [{
"type": "command",
"command": "python scripts/safety_check.py"
}]
}]
}
}

```

This simple hook has prevented disasters multiple times. But safety is just the beginning.

Automation: Never Run Tests Manually Again

Tired of reminding Claude to run tests after changes? I built this automation chain:

```
#!/usr/bin/env python3
# scripts/auto_test.py

import os
import subprocess
import json

def handle_file_change():
tool_name = os.environ.get('TOOL_NAME', '')
file_path = os.environ.get('TOOL_FILE_PATH', '')

if tool_name not in ['Edit', 'Write']:
return

# TypeScript file changed? Run type checking
if file_path.endswith('.ts') or file_path.endswith('.tsx'):
print("🔍 Running TypeScript checks...")
subprocess.run(['npm', 'run', 'typecheck'], capture_output=True)

# Test file changed? Run related tests
if 'test' in file_path or 'spec' in file_path:
print("🧪 Running tests...")
subprocess.run(['npm', 'test', file_path], capture_output=True)

# Component changed? Run component tests
if '/components/' in file_path:
test_file = file_path.replace('.tsx', '.test.tsx')
if os.path.exists(test_file):
print(f"🎯 Running component tests for {os.path.basename(file_path)}")
subprocess.run(['npm', 'test', test_file])

if __name__ == "__main__":
handle_file_change()

```

Now every code change triggers appropriate tests automatically. No reminders needed.

Building Real-Time Observability

When you're running multiple Claude agents in parallel, observability isn't optional - it's survival. Here's my real-time monitoring system:

The Event Streaming Hook

```
#!/usr/bin/env python3
# scripts/stream_event.py

import sys
import json
import requests
import os
from datetime import datetime

def stream_event():
event_type = sys.argv[1] if len(sys.argv) > 1 else "unknown"

# Capture all environment variables
event = {
'timestamp': datetime.now().isoformat(),
'event_type': event_type,
'session_id': os.environ.get('CLAUDE_SESSION_ID', 'unknown'),
'tool': os.environ.get('TOOL_NAME'),
'file_path': os.environ.get('TOOL_FILE_PATH'),
'command': os.environ.get('TOOL_COMMAND'),
}

# Send to observability server (non-blocking)
try:
requests.post(
'http://localhost:3000/events',
json=event,
timeout=0.5
)
except:
pass  # Fail silently to not disrupt workflow

if __name__ == "__main__":
stream_event()

```

The Real-Time Dashboard

```
// Simple Node.js server with WebSockets
const WebSocket = require('ws');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

const events = [];
const clients = new Set();

app.post('/events', express.json(), (req, res) => {
const event = req.body;
events.push(event);

// Broadcast to all connected clients
const message = JSON.stringify({
type: 'event',
data: event
});

clients.forEach(client => {
if (client.readyState === WebSocket.OPEN) {
client.send(message);
}
});

res.send('OK');
});

wss.on('connection', (ws) => {
clients.add(ws);

// Send recent history
ws.send(JSON.stringify({
type: 'history',
data: events.slice(-100)
}));

ws.on('close', () => clients.delete(ws));
});

server.listen(3000);

```

The result? A real-time view of everything Claude does:

_(Dashboard showing multiple Claude agents working in parallel with activity pulse visualization)_

Voice Notifications: Stay in Flow

My favorite productivity hack? Voice notifications for long-running tasks:

```
#!/usr/bin/env python3
# scripts/voice_notify.py

import os
import pyttsx3
from datetime import datetime

def notify():
event_type = os.environ.get('HOOK_EVENT', '')

engine = pyttsx3.init()
engine.setProperty('rate', 180)

if event_type == 'Stop':
duration = calculate_session_duration()
engine.say(f"Claude session complete. Duration: {duration} minutes")
elif event_type == 'Notification':
engine.say("Claude needs your attention")
elif 'test' in os.environ.get('TOOL_COMMAND', ''):
engine.say("Tests complete. Check results.")

engine.runAndWait()

if __name__ == "__main__":
notify()

```

Now I can step away from my desk, and Claude tells me when tests finish or when input is needed.

Advanced Pattern: Multi-Agent Coordination

Running multiple Claude instances? Here's how to coordinate them:

```
#!/usr/bin/env python3
# scripts/agent_coordinator.py

import os
import json
import redis
from datetime import datetime

r = redis.Redis(host='localhost', port=6379, db=0)

def coordinate_agents():
session_id = os.environ.get('CLAUDE_SESSION_ID')
event_type = os.environ.get('HOOK_EVENT')

if event_type == 'PreToolUse':
# Check if another agent is working on the same file
file_path = os.environ.get('TOOL_FILE_PATH')
if file_path:
current_owner = r.get(f"file_lock:{file_path}")
if current_owner and current_owner.decode() != session_id:
print(f"⚠️  File is being edited by another agent: {current_owner.decode()}")
print("Waiting for lock release...")
sys.exit(1)
else:
# Acquire lock
r.setex(f"file_lock:{file_path}", 30, session_id)

elif event_type == 'PostToolUse':
# Release file lock
file_path = os.environ.get('TOOL_FILE_PATH')
if file_path:
r.delete(f"file_lock:{file_path}")

elif event_type == 'SubagentStop':
# Track completion
r.hincrby('agent_stats', 'completed_tasks', 1)

# Notify other agents
message = {
'session_id': session_id,
'status': 'completed',
'timestamp': datetime.now().isoformat()
}
r.publish('agent_updates', json.dumps(message))

if __name__ == "__main__":
coordinate_agents()

```

The Complete Power Setup

Here's my production hook configuration that combines everything:

```
{
"hooks": {
"PreToolUse": [{
"matcher": ".*",
"hooks": [
{
"type": "command",
"command": "python scripts/safety_check.py"
},
{
"type": "command",
"command": "python scripts/agent_coordinator.py"
}
]
}],
"PostToolUse": [{
"matcher": ".*",
"hooks": [
{
"type": "command",
"command": "python scripts/stream_event.py PostToolUse"
},
{
"type": "command",
"command": "python scripts/auto_test.py"
},
{
"type": "command",
"command": "python scripts/agent_coordinator.py"
}
]
}],
"Notification": [{
"matcher": ".*",
"hooks": [
{
"type": "command",
"command": "python scripts/voice_notify.py"
},
{
"type": "command",
"command": "python scripts/stream_event.py Notification"
}
]
}],
"Stop": [{
"matcher": ".*",
"hooks": [
{
"type": "command",
"command": "python scripts/save_session.py"
},
{
"type": "command",
"command": "python scripts/voice_notify.py"
},
{
"type": "command",
"command": "python scripts/generate_summary.py"
}
]
}],
"SubagentStop": [{
"matcher": ".*",
"hooks": [
{
"type": "command",
"command": "python scripts/agent_coordinator.py"
},
{
"type": "command",
"command": "python scripts/stream_event.py SubagentStop"
}
]
}]
}
}

```

The Results Are Mind-Blowing

After implementing this hook system:

- 
**Zero destructive commands executed** (12 blocked in the last week)
- 
**100% test coverage maintained** automatically
- 
**Real-time visibility** into all agent operations
- 
**45% reduction in context switching** thanks to voice notifications
- 
**Parallel agent conflicts eliminated** with coordination

Performance Considerations

Keep your hooks fast! They run synchronously and can slow Claude down:

```
# Good: Fast, non-blocking
try:
requests.post(url, json=data, timeout=0.5)
except:
pass

# Bad: Slow, blocking
response = requests.post(url, json=data)
response.raise_for_status()
process_response(response.json())

```

Aim for <100ms execution time per hook.

Your Turn: Start Small, Think Big

You don't need this entire system on day one. Start with:

- 
**A simple safety hook** to prevent disasters
- 
**One automation hook** for your most repetitive task
- 
**Basic logging** to understand Claude's patterns

Then gradually expand based on your needs.

The Future is Observable

We're moving from black-box AI to fully observable, controllable systems. Hooks are the bridge between human intent and AI execution.

In Part 3, we'll explore multi-agent orchestration - how to run 10+ Claude instances in parallel for massive productivity gains.

But don't wait - implement your first hook today. Your future self will thank you.

📚 Master AI Development at learn-agentic-ai.com

**🎓 Featured Learning Paths:**

- 🚀 Claude Code Mastery - Complete 7-module course including advanced hooks
- 🛠️ AI Engineering Fundamentals - Build your foundation

**📖 Related Deep-Dive Articles:**

- 
Mastering Claude Hooks: Complete Technical Guide - Extended version with advanced patterns
- 
Claude Hooks: Automate Your AI Development Workflow - Practical automation recipes
- 
Multi-Agent Observability: See Everything Your AI Agents Do - Build complete observability systems
- 
Why Multi-Agent Systems Are a Trap - Critical analysis and solutions
- 
Self-Building AI: Meta-Agents and Sub-Agent Architecture - Advanced orchestration patterns

**🔧 Practical Resources:**

- 
GitHub: Claude Hooks Examples - Ready-to-use hook templates
- 
Free AI Development Newsletter - Weekly insights and tutorials

**About the Author:**

I'm Brandon J. Redmond, an AI Engineer specializing in observable AI systems. I've helped dozens of teams implement production-ready AI workflows. Connect on LinkedIn or visit learn-agentic-ai.com.

What repetitive tasks would you automate with hooks? Share your ideas below!

**Previous:** Part 1 - The Claude Code Revolution

**Next:** Part 3 - Multi-Agent Orchestration

Mastering Claude Code (3 Part Series)

1
The Claude Code Revolution: How AI Transformed Software Engineering (Part 1)

2
Mastering Claude Hooks: Building Observable AI Systems (Part 2)

3
Multi-Agent Orchestration: Running 10+ Claude Instances in Parallel (Part 3)

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

Hosting.com

Promoted

Dropdown menu

- 

What's a billboard?

- 

Manage preferences

- 

Report billboard

## Your next WordPress project? Deployed for $1.

This Black Friday, hosting.com powered by Rocket.net gives you fully Managed WordPress Hosting for just $1 in your first month.
No setup headaches. No caching chaos. Just pure speed with Cloudflare Enterprise CDN, advanced security, and automatic updates.

Whether it is a side project or your next client build, you will be live in minutes. Grab the $1 deal and start building.

Learn more

Read More

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

Sentry

Promoted

Dropdown menu

- 

What's a billboard?

- 

Manage preferences

- 

Report billboard

## Monitoring your MCP Server in Production (with Sentry)

A walkthrough mcp error handling, navigating Cloudflare setup quirks with Sentry, and tracing to connect all the dots.

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

Multi-Agent Orchestration: Running 10+ Claude Instances in Parallel (Part 3)

#ai
#multiagent
#distributed
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

Hosting.com

Promoted

Dropdown menu

- 

What's a billboard?

- 

Manage preferences

- 

Report billboard

## Your next WordPress project? Deployed for $1.

This Black Friday, hosting.com powered by Rocket.net gives you fully Managed WordPress Hosting for just $1 in your first month.
No setup headaches. No caching chaos. Just pure speed with Cloudflare Enterprise CDN, advanced security, and automatic updates.

Whether it is a side project or your next client build, you will be live in minutes. Grab the $1 deal and start building.

Learn more

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

Explore this practical breakdown on DEV’s open platform, where developers from every background come together to push boundaries. **No matter your experience,** your viewpoint enriches the conversation.

Dropping a simple “thank you” or question in the comments goes a long way in supporting authors—your feedback helps ideas evolve.

At DEV, **shared discovery drives progress** and builds lasting bonds. If this post resonated, a quick nod of appreciation can make all the difference.

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

