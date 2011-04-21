/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is GCLI.
 *
 * The Initial Developer of the Original Code is
 * Mozilla
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *      Joe Walker (jwalker@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var debugDependencies = false;

/**
 * Static object which allows the creation of GCLI sandboxes.
 * Exported to the outside.
 */
var GCLI = {
  /**
   * Return a new sandbox that includes standard GCLI exports plus references
   * to UI and Canon. It's not totally clear that this is the best way to
   * provide access to these functions, so their use is discouraged until we
   * have more experience in how they are needed.
   */
  create: function(options)
  {
    // Copy module defs from define.modules before we begin instantiating them
    var modules = {};
    Object.keys(moduleDefs).forEach(function(moduleName) {
      modules[moduleName] = moduleDefs[moduleName];
    });

    var depth = "";

    // Find a module definition, including instantiating it if needed
    function require(moduleName) {
      var module = modules[moduleName];
      if (module == null) {
        if (debugDependencies) {
          dump(depth + " Missing module: " + moduleName + "\n");
        }
        return null;
      }

      if (typeof module == "function") {
        var exports = {};

        if (debugDependencies) {
          dump(depth + " Compiling module: " + moduleName + "\n");
        }
        depth += ".";
        module(require, exports, { id: moduleName, uri: "" });
        depth = depth.slice(0, -1);

        // cache the resulting module object for next time
        modules[moduleName] = exports;
        return exports;
      }

      if (debugDependencies) {
        dump(depth + " Using module: " + moduleName + "\n");
      }

      return module;
    }

    var gcli = require("gcli/index");
    gcli.canon = require("gcli/canon");
    gcli.ui = require("gcli/ui/index");

    if (options && options.exposeInternalsIUnderstandTheRiskKillMePlease) {
      gcli.__modules = modules;
    }

    gcli.startup();
    delete gcli.startup;
    delete gcli.shutdown;

    return gcli;
  }
};

/**
 * Create the uber-GCLI that everyone should be using to register commands etc.
 */
GCLI.global = GCLI.create();

var EXPORTED_SYMBOLS = [ "GCLI" ];