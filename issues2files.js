#!/bin/env node

const { execSync } = require('child_process');
const fs = require('node:fs');

const mustache = require('mustache')


const DIR_OPEN = '00-issues';
const DIR_CLOSED = '00-issues/closed';


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

		// **Remove old files**
		// TODO Make the regex match a filename template.
		const r = RegExp(`^0{0,2}${i.number} - .*\.md$`)
		let old_files = [];
		old_files = old_files.concat(fs.readdirSync(DIR_OPEN)
			.filter(f => f.match(r))
			.map(f => `${DIR_OPEN}/${f}`));
		old_files = old_files.concat(fs.readdirSync(DIR_CLOSED)
			.filter(f => f.match(r))
			.map(f => `${DIR_CLOSED}/${f}`));
		console.log(old_files);
		if (old_files.length > 1) {
			throw('More than one file found');
		} else if (! old_files.length == 0) {
			fs.unlinkSync(old_files[0]);
		}

		const padded_number = i.number.toString().padStart(2, '0');
		// TODO Make `filename_safe_title` actually safe to use in filenames.
		const filename_safe_title = i.title;
		// TODO Get the filename format from a mustache template.
		const filename = `${padded_number} - ${filename_safe_title}`

		let directory;
		if (i.state == "CLOSED") {
			directory = DIR_CLOSED;
		} else {
			directory = DIR_OPEN;
		}

		fs.mkdirSync(directory, { recursive: true })
		fs.writeFileSync(`${directory}/${filename}.md`, output);
	}
}

const now = new Date();
const now_unix = Math.round(now.getTime() / 1000);
fs.writeFileSync('00-issues/.last_update', now_unix.toString());

