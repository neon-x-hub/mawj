import os from 'os';

function getExplorer() {
    const explorer_program = os.platform() == "linux" ? "xdg-open" : "explorer.exe";
    return explorer_program;
}
/**
 * Cross-platefrom utility
 * @returns {{command: string, args: string[]}}
 */
function getDefaultApp() {
    const platefrom = os.platform();
    const command = platefrom == "linux" ? "xdg-open" : "explorer.exe";
    const args = platefrom == "linux" ? [] : ['/c', 'start', '""'];
    return { command, args }
}

export { getExplorer, getDefaultApp }