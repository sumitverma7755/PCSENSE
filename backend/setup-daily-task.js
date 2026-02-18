const { execFileSync } = require('child_process');
const path = require('path');

const TASK_NAME = process.env.PCSENSEI_DAILY_TASK_NAME || 'PCSensei-Daily-Price-Check';
const DEFAULT_TIME = process.env.PCSENSEI_DAILY_TASK_TIME || '09:00';

function parseTime(value) {
    const match = String(value).trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
        throw new Error('Invalid time format. Use HH:MM (24-hour), e.g. 09:00');
    }

    const hour = Number.parseInt(match[1], 10);
    const minute = Number.parseInt(match[2], 10);

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        throw new Error('Invalid time. Hour must be 0-23 and minute must be 0-59.');
    }

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function setupDailyTask() {
    if (process.platform !== 'win32') {
        throw new Error('Daily task setup is currently supported on Windows only.');
    }

    const runTime = parseTime(process.argv[2] || DEFAULT_TIME);
    const monitorScriptPath = path.resolve(__dirname, 'price-monitor.js');
    const nodePath = process.execPath;
    const taskCommand = `"${nodePath}" "${monitorScriptPath}" --once`;

    execFileSync(
        'schtasks',
        [
            '/Create',
            '/F',
            '/SC',
            'DAILY',
            '/TN',
            TASK_NAME,
            '/ST',
            runTime,
            '/TR',
            taskCommand
        ],
        { stdio: 'inherit' }
    );

    console.log(`Daily task "${TASK_NAME}" is active.`);
    console.log(`Scheduled run time: ${runTime}`);
}

try {
    setupDailyTask();
} catch (error) {
    console.error(`Failed to setup daily task: ${error.message}`);
    process.exit(1);
}
