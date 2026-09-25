LIFE RPG — IN-APP DIALOG UPDATE

Copy every included file into the matching path in your life-rpg project and replace the existing file.

This update:
- Adds one global AppDialogProvider.
- Replaces all active window.confirm calls found in the project.
- Adds styled warning, danger, standard confirmation, and multi-choice dialogs.
- Preserves the special completed-task behavior with three choices:
  Keep task / delete and keep XP / delete and remove XP.

No SQL changes are required.

After replacing the files:
1. Stop the dev server with Ctrl+C.
2. Run npm install if node_modules was deleted.
3. Run npm run dev.
