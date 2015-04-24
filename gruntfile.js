/*
 * grunt-eo-exec
 * https://github.com/lot224/grunt-eo-exec
 *
 * Copyright (c) 2015 David Gardyasz
 * Licensed under the MIT license.
 */

'use strict';
module.exports = function (grunt) {

  grunt.initConfig({

    eo_exec: {
      test: {
        commands: [
          {
            // MSBuild.exe app\app.sln /p:Configuration=Release /t:Clean;Build
            // This executes but no console information is displayed.
            cmd: 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\msbuild.exe',
            params: [
              'app\\app.sln',
              '/p:Configuration=Release',
              '/t:Clean;Build'
            ],
            exitCode: null
          }, {
            // cmd /s /c msbuild.exe app\app.sln /p:Configuration=Release /t:Clean;Build
            // This spawns a cmd and executes the msbuild.exe in the 
            // cmd command reporting back to grunt the output.
            spawn: true,
            cmd: 'cmd',  // windows cmd.exe command which should be in the enviroment path
            params: ['/s', '/c',
              'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\msbuild.exe'
              + ' app\\app.sln'
              + ' /p:Configuration=Release'
              + ' /t:Clean;Build'
            ]
          }, {
            // A simple bat file that echo's "hello world".
            cmd: 'test.bat',
            exitCode: null
          }
        ],
      },
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // By default, lint and run all tests.
  grunt.registerTask('default', ['eo_exec']);
};