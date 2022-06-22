module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function(creep) {
        // if in target room
        if (creep.room.name == creep.memory.target) {
            // find enemy
            let targets = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            let targetStructure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
            if(targets != undefined){
           
                if(creep.rangedAttack(targets[0]) == ERR_NOT_IN_RANGE){
                    creep.moveTo(targets);
                }
                else{
                    var exit = creep.room.findExitTo(creep.memory.home);
                    // and move to exit
                    creep.moveTo(creep.pos.findClosestByRange(exit));
                }
                creep.heal(creep);
            }
            if(targetStructure != undefined){
                if(creep.rangedAttack(targetStructure) == ERR_NOT_IN_RANGE){
                    creep.moveTo(targetStructure);
                }
            }
            else{
                creep.moveTo(creep.room.controller);
            }
            
        }
        // if not in target room
        else {
            // find exit to target room
            let exit = creep.room.findExitTo(creep.memory.target);
            // move to exit
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
    }
};