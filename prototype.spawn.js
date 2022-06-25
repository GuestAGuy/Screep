var listOfRoles = ['harvester', 'Hercules', 'claimer', 'upgrader', 'repairer', 'SCV', 'wallRepairer'];

// create a new function for StructureSpawn
StructureSpawn.prototype.spawnCreepsIfNecessary =
    function () {
        /** @type {Room} */
        let room = this.room;
        // find all creeps in room
        /** @type {Array.<Creep>} */
        let creepsInRoom = room.find(FIND_MY_CREEPS);
        
        // count the number of creeps alive for each role in this room
        // _.sum will count the number of properties in Game.creeps filtered by the
        //  arrow function, which checks for the creep being a specific role
        /** @type {Object.<string, number>} */
        let numberOfCreeps = {};
        for (let role of listOfRoles) {
            numberOfCreeps[role] = _.sum(creepsInRoom, (c) => c.memory.role == role);
        }
        let maxEnergy = room.energyCapacityAvailable;
        let name = undefined;
        // console.log(maxEnergy);
        // if no harvesters are left AND either no miners or no Hercules are left
        //  create a backup creep
        if (numberOfCreeps['harvester'] == 0 && numberOfCreeps['Hercules'] == 0) {
            // if there are still miners or enough energy in Storage left
            if (numberOfCreeps['MULE'] > 0 ||
                (room.storage != undefined && room.storage.store[RESOURCE_ENERGY] >= 150 + 550)) {
                // create a Hercules
                name = this.createHercules(150);
            }
            // if there is no MULE and not enough energy in Storage left
            else {
                // create a harvester because it can work on its own
                name = this.createCustomCreep(room.energyAvailable, 'harvester');
            }
        }
        // if no backup creep is required
        else {
            // check if all sources have miners
            let sources = room.find(FIND_SOURCES);
            // iterate over all sources
            for (let source of sources) {
                // if the source has no miner
                if (!_.some(creepsInRoom, c => c.memory.role == 'MULE' && c.memory.sourceId == source.id)) {
                    // check whether or not the source has a container
                    /** @type {Array.StructureContainer} */
                    let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER
                    });
                    // if there is a container next to the source
                    if (containers.length > 0) {
                        // spawn a MULE
                        name = this.createMULE(source.id);
                        break;
                    }
                }
            }
        }

        // if none of the above caused a spawn command check for other roles
        if (name == undefined) {
            for (let role of listOfRoles) {
                // check for claim order
                if (role == 'claimer' && this.memory.claimRoom != undefined) {
                    // try to spawn a claimer
                    name = this.createClaimer(this.memory.claimRoom);
                    // if that worked
                    if (name != undefined && _.isString(name)) {
                        // delete the claim order
                        delete this.memory.claimRoom;
                    }
                }
                // if no claim order was found, check other roles
                else if (numberOfCreeps[role] < this.memory.minCreeps[role]) {
                    if (role == 'Hercules') {
                        name = this.createHercules(300);
                    }
                    else if(role == 'repairer'){
                        name = this.createCustomCreep(400,role);
                    }
                    else {
                        name = this.createCustomCreep(maxEnergy, role);
                    }
                    break;
                }
            }
        }
        
        // if none of the above caused a spawn command check for LongDistanceHarvesters
        /** @type {Object.<string, number>} */
        let numberOfLongDistanceHarvesters = {};
        if (name == undefined) {
            // count the number of long distance harvesters globally
            for (let roomName in this.memory.minLongDistanceHarvesters) {
                numberOfLongDistanceHarvesters[roomName] = _.sum(Game.creeps, (c) =>
                    c.memory.role == 'longDistanceHarvester' && c.memory.target == roomName)

                if (numberOfLongDistanceHarvesters[roomName] < this.memory.minLongDistanceHarvesters[roomName]) {
                    name = this.createLongDistanceHarvester(maxEnergy, 3, room.name, roomName, 1);
                }
            }
        }

        // print name to console if spawning was a success
        if (name != undefined && _.isString(name)) {
            console.log(this.name + " spawned new creep: " + name + " (" + Game.creeps[name].memory.role + ")");
            for (let role of listOfRoles) {
                console.log(role + ": " + numberOfCreeps[role]);
            }
            for (let roomName in numberOfLongDistanceHarvesters) {
                console.log("LongDistanceHarvester" + roomName + ": " + numberOfLongDistanceHarvesters[roomName]);
            }
        }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createCustomCreep =
    function (energy, roleName) {
        // create a balanced body as big as possible with the given energy
        energy = Math.min(1500, energy);
        var numberOfParts = Math.floor(energy / 200);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        var body = [];
        for (let i = 0; i < numberOfParts; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }
        var newName = 'SCV-' + Game.time%100;
        // create creep with the created body and the given role
        return this.createCreep(body, newName, { role: roleName, working: false });
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createLongDistanceHarvester =
    function (energy, numberOfWorkParts, home, target, sourceIndex) {
        // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
        var body = [];
        for (let i = 0; i < numberOfWorkParts; i++) {
            body.push(WORK);
        }

        // 150 = 100 (cost of WORK) + 50 (cost of MOVE)
        energy -= 150 * numberOfWorkParts;

        var numberOfParts = Math.floor(energy / 100);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor((50 - numberOfWorkParts * 2) / 2));
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
            body.push(MOVE);
        }
        var newName = 'Reaper-' + Game.time%100;
        // create creep with the created body
        return this.createCreep(body, newName, {
            role: 'longDistanceHarvester',
            home: home,
            target: target,
            sourceIndex: sourceIndex,
            working: false
        });
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createClaimer =
    function (target) {
        return this.createCreep([CLAIM, MOVE], undefined, { role: 'claimer', target: target });
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createMULE =
    function (sourceId) {
        var newName = 'MULE-' + Game.time%100;
        return this.createCreep([WORK, WORK, WORK, WORK, WORK, MOVE], newName,
                                { role: 'MULE', sourceId: sourceId });
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createHercules =
    function (energy) {
        // create a body with twice as many CARRY as MOVE parts
        var numberOfParts = Math.floor(energy / 150);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        var body = [];
        for (let i = 0; i < numberOfParts * 2; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }
        var newName = 'Hercules-' + Game.time%100;
        // create creep with the created body and the role 'Hercules'
        return this.createCreep(body, newName, { role: 'Hercules', working: false });
    };