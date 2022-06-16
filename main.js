var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleRepairer = require('role.repairer');
var roleSCV = require('role.SCV');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var SCVs = _.filter(Game.creeps, (creep) => creep.memory.role == 'SCV');
    var Upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    //console.log('Harvesters: ' + harvesters.length);

    if(SCVs.length < 6) {
        var newName = 'SCV-' + Game.time%100;
        var ran = Game.time%2;
        console.log('Spawning new SCV: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], newName,{memory: {role: 'SCV', working: false, task: 0, num: 1}});
    }
    else if(Upgraders.length <4){
        var newName = 'Upgrader' + Game.time%100;
        console.log('Spawning new upgraders: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], newName,{memory: {role: 'upgrader'}});
    }
    else if(repairers.length<1){
        var newName = 'repairer' + Game.time%100;
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE], newName,{memory: {role: 'repairer'}});
    }
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️ Building ' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'SCV') {
            roleSCV.run(creep);
        }
        if(creep.memory.role == 'repairer'){
            roleRepairer.run(creep);
        }
    }
}