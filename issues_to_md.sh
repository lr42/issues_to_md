ISSUE_DIR="00-issues"

BIN_DIR=$(dirname $0)
GIT_ROOT=$(git rev-parse --show-toplevel)

FULL_ISSUE_DIR=$GIT_ROOT/$ISSUE_DIR
echo Writing files to $FULL_ISSUE_DIR
mkdir -p $FULL_ISSUE_DIR

echo Fetching issues...
for i in $(gh issue list --json number | jq -r '.[] | .number')
do
	PADDED_NUMBER=$(printf "%04d" $i)
	ISSUE_TITLE=$(gh issue view $i --json title --jq '.title')
	FILE_NAME="$PADDED_NUMBER - $ISSUE_TITLE"
	echo "$FILE_NAME"
	gh issue view $i \
		--json number,title,url,state,author,createdAt,updatedAt,body,comments \
		--template "$(cat $BIN_DIR/issue_template)" \
		> "$FULL_ISSUE_DIR/$FILE_NAME.md"
done
