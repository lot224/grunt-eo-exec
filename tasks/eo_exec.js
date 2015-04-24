/*
 * grunt-eo-exec
 * https://github.com/lot224/grunt-eo-exec
 *
 * Copyright (c) 2015 David Gardyasz
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  var cp = require('child_process')
    , format = require('util').format
    , _ = grunt.util._
    , log = grunt.log
    , verbose = grunt.verbose;

  var queue = [];
  var done = null;
  var errors = false;

  var add = function (item) {
    var cmd = {
      spawn: item.spawn !== undefined ? item.spawn : false,
      command: item.command || item.cmd || (_.isString(item) && item) || null,
      arguments: item.parameters || item.params || item.arguments || item.args || [],
      cwd: item.workingDirectory || item.cwd || process.cwd(),
      stdOut: item.stdOut !== undefined ? item.stdOut : true,
      stdErr: item.stdErr !== undefined ? item.stdErr : true,
      callBack: _.isFunction(item.callBack) ? item.callBack : function () { },
      exitCodes: item.exitCodes || item.exitCode
    }

    cmd.exitCodes = _.isArray(cmd.exitCodes) ? cmd.exitCodes : cmd.exitCodes !== undefined ? [cmd.exitCodes] : [0];

    if (!cmd.command) {
      log.error('Missing command parameter.');
      return false;
    }

    if (_.isFunction(cmd.command))
      cmd.command = cmd.command.apply(grunt, [].slice.call(arguments, 0))

    if (!_.isString(cmd.command)) {
      log.error('Command property must be a string.');
      return false;
    }

    cmd.arguments = _.isArray(cmd.arguments) ? cmd.arguments : [cmd.arguments];

    queue.push(cmd);
    return true;
  }

  var processTask = function (cmd) {
    if (!cmd) { return done(!errors) }

    var childProcess;

    log.subhead(format(
        "=======================================\n"
      + "Command: %s\n"
      + "Arguments: %s\n",
      cmd.command,
      cmd.arguments.join(", ")
    ));

    if (cmd.spawn) {
      childProcess = cp.spawn(cmd.command, cmd.arguments, {
        cwd: cmd.cwd, maxBuffer: true
      }, cmd.callback);
    } else {
      childProcess = cp.exec(cmd.command + ' ' + cmd.arguments.join(' '), {
        cwd: cmd.cwd, maxBuffer: true
      }, cmd.callback);
    }

    cmd.stdOut && childProcess.stdout.on('data', function (d) { log.write(d); });
    cmd.stdErr && childProcess.stderr.on('data', function (d) { log.error(d); });

    childProcess.on('error', function (err) {
      log.error(format('Failed with: %s', err));
      errors = true;
    });

    childProcess.on('exit', function (code) {
      if (cmd.exitCodes.indexOf(code) < 0) {
        log.error(format('(%s) Exited with code: %d.', cmd.command, code));
        errors = true;
      }
      processTask(queue.shift());
    });
  }

  grunt.registerMultiTask('eo_exec', 'Task to execute/spawn shell commands', function () {
    var commands = this.data['commands'] || this.data['cmds'];

    if (typeof commands === 'object') {
      if (commands instanceof Array) {
        for (var index in commands) {
          add(commands[index]);
        }
      }
      else add(commands);
    }

    done = this.async();
    processTask(queue.shift());
  });
};
