import { CommanderError } from 'commander';

import { failure, type FailureReport } from '../reporter';

const COMMANDER_SILENT_EXIT_CODES = new Set([
  'commander.helpDisplayed',
  'commander.help',
  'commander.version',
]);

// Map commander's internal error codes to our public failure taxonomy so
// agents don't couple to commander's naming.
const COMMANDER_CODE_MAP: Record<string, string> = {
  'commander.unknownOption': 'unknown_option',
  'commander.unknownCommand': 'unknown_command',
  'commander.missingArgument': 'missing_argument',
  'commander.optionMissingArgument': 'missing_argument',
  'commander.missingMandatoryOptionValue': 'missing_required_flag',
  'commander.invalidOptionArgument': 'invalid_option_value',
  'commander.invalidArgument': 'invalid_argument',
  'commander.variadicArgNotLast': 'invalid_argument',
};

export function isSilentCommanderExit(err: CommanderError): boolean {
  return COMMANDER_SILENT_EXIT_CODES.has(err.code);
}

export function commanderErrorToFailure(err: CommanderError): FailureReport {
  return failure({
    command: 'cli',
    code: COMMANDER_CODE_MAP[err.code] ?? 'commander_error',
    message: err.message,
  });
}
