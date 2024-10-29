#!/bin/env node

const { execSync } = require('child_process');
const fs = require('node:fs');

const mustache = require('mustache')


// TODO Test for `git` and `gh`...
//   Tell the user how to install them if they are not installed.

execSync('gh issue list --state all --json assignees,closed,closedAt,id,isPinned,labels,milestone,projectCards,reactionGroups,stateReason,number,title,url,state,author,createdAt,updatedAt,body,comments > ./00-issues/.issues.json')
// `projectItems` is not accessible without setting up tokens specially.

const data = JSON.parse(fs.readFileSync('./00-issues/.issues.json'));
//console.log(data);

last_update = new Date(Number(fs.readFileSync('00-issues/.last_update')) * 1000);
//console.log(last_update);

const mustache_template = fs.readFileSync('00-issues/.issue_template.mustache').toString();
//console.log(mustache_template);

for (let i of data) {
	let updatedAt = new Date(i.updatedAt)
	if (updatedAt > last_update) {
		//console.log(i.number);
		//console.log(i.title);
		console.log(mustache.render("Issue {{number}}: {{{title}}}", i));

		i.body = i.body.trim();
		for (let c of i.comments) {
			c.body = c.body.trim();
		}

		let output = mustache.render(mustache_template, i);
		output = output.trim();
		//console.log('\n *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *\n');
		//console.log(output);

		const padded_number = i.number.toString().padStart(2, '0');
		// TODO Make `filename_safe_title` actually safe to use in filenames.
		const filename_safe_title = i.title;
		// TODO Get the filename format from a mustache template.
		const filename = `${padded_number} - ${filename_safe_title}`
		fs.writeFileSync(`00-issues/${filename}.md`, output);
	}
}

const now = new Date();
fs.writeFileSync('00-issues/.last_update', now.getTime().toString());

