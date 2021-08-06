//The playerID must be the player's xuid.
//TODO:Emphasize the prerequisite above.
//TODO:Discuess the repetitive code
import './plugin/index.js';
import { systemInstance as system, emptyPlatform, Coordinate, Position, BlockType, Direction, Block } from 'norma-core';

// import { utils } from '../utils.js'
const lastTimeOfPlayerRequest = new Map()

function assembleUseItemData(player, block) {
    function getDirectionFromPlayer(player) {
        let rotation = player.getTag().getTag("Rotation").toArray()
        return new Direction(rotation[0], rotation[1])
    }
    let { x, y, z } = block.pos
    let dimension = block.pos.dimid
    return {
        blockType: new BlockType(block.type, block.getBlockState()),
        position: new Position({ x, y, z }, dimension),
        direction: getDirectionFromPlayer(player)
    }
}
system.inject({
    createRuntime: function (id) {
        let user = system.getUser(id);
        return {
            logger: loggerFactory(id)
        };
    }
})

mc.listen("onPlaceBlock", (player, block) => {
    handlePlayerRequest({ requestType: "get_block_type", playerID: player.xuid, additionalData: assembleUseItemData(player, block) })
    return true
})
mc.listen("onUseItemOn", (player, item, block) => {
    if (item.type.startsWith("normaconstructor:")) {
        handlePlayerRequest({ requestType: item.type.slice(item.type.indexOf(":") + 1), playerID: player.xuid, additionalData: assembleUseItemData(player, block) })
    }
    return true
})

function getUser(playerID) {
    function registerNewUser(playerID) {
        let user = system.createUser(playerID)
        //TODO:Separate the following initialization process from this function.
        user.session["__requestAdditionalPosition"] = false;
        user.session["__requestAdditionalBlockType"] = false;
        user.session["__requestAdditionalDirection"] = false;
        user.session["__logLevel"] = "verbose";
        user.session["__on"] = true;
        return user;
    }
    return system.hasUser(playerID) ? system.getUser(playerID) : registerNewUser(playerID)
}

function handlePlayerRequest({ requestType, playerID, additionalData }) {
    //Debounce.
    const last = lastTimeOfPlayerRequest.get(playerID), now = Date.now()
    lastTimeOfPlayerRequest.set(playerID, now)
    if (last && now - last < 400) return

    let user = getUser(playerID)
    const logger = loggerFactory(playerID)
    logger.log("verbose", "NZ IS JULAO!")
    logger.logObject("verbose", { requestType, playerID, additionalData })
    switch (requestType) {
        case "get_position":
        case "get_direction":
        case "get_block_type": {
            if (requestType == "get_position" || user.session["__requestAdditionalPosition"]) user.addPosition(additionalData.position)
            if (requestType == "get_direction" || user.session["__requestAdditionalDirection"]) user.addDirection(additionalData.direction)
            if (requestType == "get_block_type" || user.session["__requestAdditionalBlockType"]) user.addBlockType(additionalData.blockType)
            break;
        }
        case "get_air": {
            user.addBlockType(new BlockType("minecraft:air", {}))
            break;
        }
        case "remove_last_position": {
            logger.log("info", "Removing the last position...")
            user.removePosition()
            break;
        }
        case "remove_last_blocktype": {
            logger.log("info", "Removing the last blockType...")
            user.removeBlockType()
            break;
        }
        case "remove_last_direction": {
            logger.log("info", "Removing the last direction...")
            user.removeDirection()
            break;
        }
        case "choose_next_generator": {
            logger.log("info", "Choosing next generator...")
            user.nextGenerator()
            logger.log("debug", "Current generator:")
            logger.logObject("debug", user.getCurrentGeneratorName())
            break;
        }
        case "show_saved_data": {
            //logger.log("info", "Current positionArray:")
            //logger.logObject("info", generatorArray[generatorIndex].positionArray)
            //logger.log("info", "Current blockTypeArray:")
            //logger.logObject("info", generatorArray[generatorIndex].blockTypeArray)
            //logger.log("info", "Current directionArray:")
            //logger.logObject("info", generatorArray[generatorIndex].directionArray)
            logger.log("info", "Current generator name:")
            logger.logObject("info", user.getCurrentGeneratorName())
            logger.log("info", "Current generator state:")
            logger.logObject("info", user.getCurrentState())
            logger.log("info", "Current session:")
            logger.logObject("info", user.session)
            break;
        }
        case "execute": {
            execute(playerID);
            break;
        }
        case "show_menu": {
            //TODO
            let player = mc.getPlayer(playerID)
            // player.sendModalForm("NZ IS JULAO", "Is NZ JULAO?", "YES!", "Of course!", (player, id) => {
            //     log(id)
            // })

            // let form=mc.newSimpleForm()
            // form.setTitle("title")
            // form.addButton("123")
            // form.addButton("123")
            // form.addButton("123")
            // form.addButton("123")
            // form.addButton("123")
            // form.addButton("123")
            // player.sendForm(form,()=>{})
            let user = getUser(playerID)
            let ui = user.getCurrentUI() ?? []

            let form = mc.newCustomForm()
            form.setTitle(user.getCurrentGeneratorName())
            ui.forEach(e => {
                switch (e["viewtype"]) {
                    case "text": {
                        form.addLabel(e.text)
                        break;
                    }
                    case "button":
                    case "checkbox": {
                        let defaultValue = user.getCurrentState()[e.key]
                        let defaultChoice = e.data.findIndex(choice => choice.value == defaultValue)
                        form.addDropdown(e.text, Array.from(e.data, choice => choice.text), defaultChoice == -1 ? 0 : defaultChoice)
                        break;
                    }
                    case "edittext": {
                        // form.addInput(e.text, "", user.getCurrentState()[e.key])
                        form.addInput(e.text,`Input ${typeof user.getCurrentState()[e.key]} here`, user.getCurrentState()[e.key].toString())
                        // form.addInput(e.text,`Input number here`, user.getCurrentState()[e.key].toString())

                        break;
                    }
                }
            });
            player.sendForm(form, (player, data) => {
                if (!data) return
                log(data)
                data.forEach((e, i) => {
                    switch (ui[i]["viewtype"]) {
                        case "text": {
                            break;
                        }
                        case "button":
                        case "checkbox": {
                            user.getCurrentState()[ui[i].key] = ui[i].data[e].value
                            break;
                        }
                        case "edittext": {
                            // form.addInput(e.text, "", user.getCurrentState()[e.key])
                            // form.addInput(e.text,`Input ${typeof user.getCurrentState()[e.key]} here`, user.getCurrentState()[e.key].toString())
                            user.getCurrentState()[ui[i].key] = e
                            break;
                        }
                    }
                    if (ui[i].hasOwnProperty("dataForUIHandler")) user.UIHandler(ui[i]["dataForUIHandler"])
                })

            })
            break;
        }
        case "run_nos": {
            user.runNOS(additionalData.nos, undefined)
            break;
        }
    }
}
mc.listen("onPlayerCmd", (player, cmd) => {
    if (cmd.startsWith("/nos:")) {
        handlePlayerRequest({ requestType: "run_nos", playerID: player.xuid, additionalData: { nos: cmd.slice("/nos:".length) } })
        return false
    }
    return true
})
let compiler = {
    raw: function (blockArray) {
        return blockArray
    },
    clone: function ({ startCoordinate, endCoordinate, targetCoordinate }) {
        if (startCoordinate.x >= endCoordinate.x) {
            let temp = startCoordinate.x
            startCoordinate.x = endCoordinate.x
            endCoordinate.x = temp
        }
        if (startCoordinate.y >= endCoordinate.y) {
            let temp = startCoordinate.y
            startCoordinate.y = endCoordinate.y
            endCoordinate.y = temp
        }
        if (startCoordinate.z >= endCoordinate.z) {
            let temp = startCoordinate.z
            startCoordinate.z = endCoordinate.z
            endCoordinate.z = temp
        }
        for (let x = startCoordinate.x; x <= endCoordinate.x; x += 32)
            for (let y = startCoordinate.y; y <= endCoordinate.y; y += 32)
                for (let z = startCoordinate.z; z <= endCoordinate.z; z += 32)
                    mc.runcmd(`clone ${x} ${y} ${z} 
            ${Math.min(x + 31, endCoordinate.x)} 
            ${Math.min(y + 31, endCoordinate.y)} 
            ${Math.min(z + 31, endCoordinate.z)} 
            ${targetCoordinate.x + x - startCoordinate.x} 
            ${targetCoordinate.y + y - startCoordinate.y} 
            ${targetCoordinate.z + z - startCoordinate.z} 
            masked force`, (commandResultData) => { });

        return []
    },
    fill: function ({ blockType, startCoordinate, endCoordinate }) {

        if (startCoordinate.x >= endCoordinate.x) {
            let temp = startCoordinate.x
            startCoordinate.x = endCoordinate.x
            endCoordinate.x = temp
        }
        if (startCoordinate.y >= endCoordinate.y) {
            let temp = startCoordinate.y
            startCoordinate.y = endCoordinate.y
            endCoordinate.y = temp
        }
        if (startCoordinate.z >= endCoordinate.z) {
            let temp = startCoordinate.z
            startCoordinate.z = endCoordinate.z
            endCoordinate.z = temp
        }

        //Bypass the restriction of 32767 blocks
        for (let x = startCoordinate.x; x <= endCoordinate.x; x += 32)
            for (let y = startCoordinate.y; y <= endCoordinate.y; y += 32)
                for (let z = startCoordinate.z; z <= endCoordinate.z; z += 32)
                    mc.runcmd(`fill ${x} ${y} ${z} 
            ${Math.min(x + 31, endCoordinate.x)} 
            ${Math.min(y + 31, endCoordinate.y)} 
            ${Math.min(z + 31, endCoordinate.z)} 
            ${blockType.blockIdentifier.slice(blockType.blockIdentifier.indexOf(":") + 1)} 
            [${blockType.blockState == null ? "" : JSON.stringify(blockType.blockState).slice(1, -1)}] replace`, (commandResultData) => { }
                    );

        return []
    }
    //TODO
    //,
    // writeBuildingStructureToLog: function ({ startCoordinate, endCoordinate, referenceCoordinate, tickingArea }) {
    //     if (startCoordinate.x >= endCoordinate.x) [startCoordinate.x, endCoordinate.x] = [endCoordinate.x, startCoordinate.x]
    //     if (startCoordinate.y >= endCoordinate.y) [startCoordinate.y, endCoordinate.y] = [endCoordinate.y, startCoordinate.y]
    //     if (startCoordinate.z >= endCoordinate.z) [startCoordinate.z, endCoordinate.z] = [endCoordinate.z, startCoordinate.z]
    //     for (let x = startCoordinate.x; x <= endCoordinate.x; x++)
    //         for (let y = startCoordinate.y; y <= endCoordinate.y; y++)
    //             for (let z = startCoordinate.z; z <= endCoordinate.z; z++) {
    //                 let blockType = new BlockType(undefined, undefined)
    //                 let block = serverSystem.getBlock(tickingArea, new Coordinate(x, y, z))
    //                 blockType.blockIdentifier = block.__identifier__
    //                 blockType.blockState = serverSystem.getComponent(block, "minecraft:blockstate").data
    //                 server.log(JSON.stringify({ coordinate: new Coordinate(x - referenceCoordinate.x, y - referenceCoordinate.y, z - referenceCoordinate.z), blockType: blockType }, null, '    '))
    //             }
    //     return []
    // }
}
async function execute(playerID) {
    let user = getUser(playerID)
    let logger = loggerFactory(playerID);
    logger.log("info", "Start validating parameters...");
    let isVaild = await user.isValidParameter();
    if (isVaild) {
        logger.log("info", "Now Execution started.");

        let buildInstructions = await user.generate();
        if (buildInstructions === undefined) return;

        logger.logObject("verbose", buildInstructions)

        for (let buildInstruction of buildInstructions) {
            //I know it looks silly... "Compatibility reason".
            if (!buildInstruction.hasOwnProperty("type")) setBlock(buildInstruction)
            else {
                //Another compromise...
                //'Compliers' don't just complie: the fill() method can be invoked in which block will be placed directly.
                let blocks = compiler[buildInstruction.type](buildInstruction.data)
                for (let block of blocks) setBlock(block)
            }
        }
    }
}
function displayObject(object, playerID) {
    displayChat(JSON.stringify(object, null, '    '), playerID)
}
function displayChat(message, playerID) {
    if (playerID) {
        let player = mc.getPlayer(playerID)
        player.tell(message)
    }
    else mc.runcmd(`say ${message}`)

}

function setBlock(block) {

    //displayChat("§b We all agree, NZ is JULAO!")
    let blockType = block.blockType
    let position = block.position
    let coordinate = position.coordinate
    // STILL thank you, WavePlayz!


    //TODO:
    //It currently use destroy mode to force replace the old block, but will leave tons of items.
    //Might change to set air block first.
    //NEW TODO: UNDERSTANDING WHAT THE FUDGE I WAS TALKING ABOUT HERE.
    mc.runcmd(`/setblock ${coordinate.x} ${coordinate.y} ${coordinate.z} ${blockType.blockIdentifier.slice(blockType.blockIdentifier.indexOf(":") + 1)} [${blockType.blockState == null ? "" : JSON.stringify(blockType.blockState).slice(1, -1)}] replace`, (commandResultData) => {

    });
}
function loggerFactory(playerID) {
    return {
        displayChat, displayObject,
        log: function (level, message) {
            const colorMap = new Map([
                ["verbose", { num: 0, color: "§a" }],
                ["debug", { num: 1, color: "§6" }],
                ["info", { num: 2, color: "§b" }],
                ["warning", { num: 3, color: "§e" }],
                ["error", { num: 4, color: "§c" }],
                ["fatal", { num: 5, color: "§4" }]
            ])
            const user = getUser(playerID)
            if (colorMap.get(level).num >= colorMap.get(user.session["__logLevel"]).num)
                this.displayChat(colorMap.get(level).color + "[" + level + "]" + message, playerID)
        },
        logObject: function (level, object) {
            this.log(level, JSON.stringify(object, null, '    '))
        }
    }
}


