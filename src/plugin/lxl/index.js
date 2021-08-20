import { systemInstance as system, Description, Usage, Block, Coordinate, Position, BlockType, BuildInstruction, canonicalGeneratorFactory } from 'norma-core';
import { utils } from '../utils'
function deepEqual(a, b) {
    return a === b || (a && b && typeof a === "object" && typeof b === "object" && Object.keys(a).length === Object.keys(b) && Object.keys(a).every((property) => deepEqual(a[property], b[property])))
}
// system.registerCanonicalGenerator({
//     description: new Description("NZ IS JULAO", new Usage([], [], [], [
//         {
//             viewtype: "button",
//             text: "Set branch direction.",
//             key: "branch_direction",
//             data: [
//                 { value: "-z", text: "-z" },
//                 { value: "+z", text: "+z" }
//             ]
//         },
//         {
//             viewtype: "edittext",
//             text: "Song number:",
//             key: "song_number",
//             dataForUIHandler: ""
//         }
//     ])),
//     criteria: { positionArrayLength: 1, blockTypeArrayLength: 0, directionArrayLength: 0 },
//     option: { "branch_direction": "-z", "song_number": 0, "song_name": "" },
//     method: {
//         UIHandler: function () { }, generate: function (e) {
//             const positionArray = e.startCoordinate.positions
//             const { logger, file } = e.runtime

//             const { branch_direction, song_number } = this.option
//             logger.log("verbose", branch_direction)
//             let blockArray = []

//             // const song = preset.songs[song_number]
//             const song = JSON.parse(file.readFrom("./123.json"))
//             if (song == undefined) {
//                 logger.log("error", "No such song!")
//                 throw "But still, NZ IS JULAO!"
//             }
//             const tickOfSection = song.tickOfSection
//             logger.log("verbose", "NZ IS JULAO!")

//             function generateBlocksPerSection(coordinate, section) {

//                 function setNoteBlock(coordinate, note) {
//                     logger.log("verbose", "Oh...NZ IS JULAO!")
//                     let { pitch, instrument } = note
//                     let noteBlockSourceCoordinate = positionArray[0].coordinate
//                     let offset_z = Math.floor(pitch / 5), offset_x = pitch % 5, offset_y = 0
//                     logger.log("verbose", "Err...NZ IS JULAO!")
//                     // if (instrument != null) blockArray.push(new Block(new Position(new Coordinate(coordinate.x, coordinate.y - 1, coordinate.z), positionArray[0].dimension), new BlockType(instrument, {})))
//                     switch (instrument) {
//                         case "higher": offset_y = 2; break;
//                         case "high": offset_y = 1; break;
//                         case null: offset_y = 0; break;
//                         case "low": offset_y = -1; break;
//                         case "lower": offset_y = -2; break;
//                     }
//                     blockArray.push(new BuildInstruction("clone",
//                         {
//                             startCoordinate: new Coordinate(noteBlockSourceCoordinate.x + offset_x, noteBlockSourceCoordinate.y + offset_y, noteBlockSourceCoordinate.z + offset_z),
//                             endCoordinate: new Coordinate(noteBlockSourceCoordinate.x + offset_x, noteBlockSourceCoordinate.y + offset_y, noteBlockSourceCoordinate.z + offset_z),
//                             targetCoordinate: coordinate
//                         })
//                     )
//                 }
//                 function setBedBlock(coordinate) {
//                     blockArray.push(new Block(new Position(coordinate, positionArray[0].dimension), new BlockType("minecraft:grass", {})))
//                 }
//                 function setRepeater(coordinate, delay, direction) {
//                     setBedBlock(new Coordinate(coordinate.x, coordinate.y - 1, coordinate.z))
//                     blockArray.push(new Block(
//                         new Position(coordinate, positionArray[0].dimension),
//                         utils.blockGeometry.setBlockDirection(new BlockType("minecraft:unpowered_repeater", { repeater_delay: delay, direction: 0 }), direction)
//                     ))
//                 }
//                 function setRedstoneDust(coordinate) {
//                     setBedBlock(new Coordinate(coordinate.x, coordinate.y - 1, coordinate.z))
//                     blockArray.push(new Block(
//                         new Position(coordinate, positionArray[0].dimension),
//                         new BlockType("minecraft:redstone_wire", { redstone_signal: 0 })
//                     ))
//                 }
//                 function setRedstoneMechanism(coordinate, delay, direction) {
//                     if (delay > 0) setRepeater(coordinate, delay - 1, direction)
//                     else setRedstoneDust(coordinate)
//                 }

//                 let offset_x = 0
//                 logger.log("verbose", "Yes, NZ IS JULAO!")

//                 for (let tick = 0; tick < tickOfSection;) {
//                     if (tickOfSection - tick >= 4) {
//                         setRedstoneMechanism(new Coordinate(coordinate.x + offset_x, coordinate.y, coordinate.z), 4, "-x")
//                         tick += 4
//                     }
//                     else {
//                         setRedstoneMechanism(new Coordinate(coordinate.x + offset_x, coordinate.y, coordinate.z), tickOfSection - tick, "-x")
//                         tick = tickOfSection
//                     }
//                     offset_x++;
//                 }
//                 setRedstoneDust(new Coordinate(coordinate.x + offset_x, coordinate.y, coordinate.z))

//                 function generateNoteBlocks(coordinate, section) {

//                     let lastTick = 0
//                     section.sort((a, b) => { return a.tickOffset < b.tickOffset })
//                     function sign(branch_direction) { return branch_direction == "-z" ? -1 : 1 }

//                     let oppositeDirection = (branch_direction == "+z" ? "-z" : "+z")

//                     let offset_z = 1;
//                     for (let note of section) {
//                         note.tickOffset = Math.floor(note.tickOffset)
//                         if (note.tickOffset == lastTick) {
//                             setRedstoneDust(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z))
//                             offset_z++
//                             setRedstoneDust(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z))
//                             setRedstoneDust(new Coordinate(coordinate.x - 1, coordinate.y, coordinate.z + sign(branch_direction) * offset_z))
//                             setNoteBlock(new Coordinate(coordinate.x - 2, coordinate.y, coordinate.z + sign(branch_direction) * offset_z), note)
//                         }
//                         else {
//                             for (let tick = 0; tick < note.tickOffset - lastTick;) {
//                                 if (note.tickOffset - lastTick - tick >= 4) {
//                                     setRedstoneMechanism(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z), 4, oppositeDirection)
//                                     tick += 4
//                                 }
//                                 else {
//                                     setRedstoneMechanism(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z), note.tickOffset - lastTick - tick, oppositeDirection)
//                                     tick = note.tickOffset - lastTick
//                                 }
//                                 offset_z++;
//                             }
//                             setNoteBlock(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z), note)
//                         }
//                         // setRedstoneMechanism(new Coordinate(coordinate.x, coordinate.y, coordinate.z + offset_z), note.tickOffset - lastTick, "-z")
//                         lastTick = note.tickOffset
//                         logger.log("verbose", "So...NZ IS JULAO!")
//                         offset_z++
//                     }
//                 }

//                 generateNoteBlocks(new Coordinate(coordinate.x + offset_x, coordinate.y, coordinate.z), section)
//                 offset_x++
//                 return offset_x;
//             }
//             let offset_x = 0
//             const startCoordinate = positionArray[1].coordinate

//             for (let score of song.score) {

//                 offset_x += generateBlocksPerSection(new Coordinate(startCoordinate.x + offset_x, startCoordinate.y, startCoordinate.z), score)
//             }

//             return blockArray
//         }
//     }
// })

system.registerCanonicalGenerator({
    description: new Description("maze", new Usage([], [], [], [
        {
            viewtype: "edittext",
            text: "Side length:",
            key: "sideLength",

        }
    ])),
    criteria: { positionArrayLength: 1, blockTypeArrayLength: 1, directionArrayLength: 0 },
    option: {
        "sideLength": 10
    },
    method: {
        generate: function (e) {
            let { state, runtime } = e;
            let { logger } = runtime;
            let coordinate = state.positions[0].coordinate
            let blockType = state.blockTypes[0]

            function getRandomInt(min, max) {
                return Math.floor(min + Math.random() * (max - min))
            }
            const N = e.state["sideLength"]
            let visited = Array.from(new Array(N), () => (new Array(N)).fill(false))
            let C = [[getRandomInt(0, N), getRandomInt(0, N)]]
            visited[C[0][0]][C[0][1]] = true;

            let W = []

            while (!(C.length == 0)) {
                let V = (() => {
                    return C[getRandomInt(0, C.length)]
                })()

                function getUnvisitedNeighbor(V) {
                    let neighbor = [[V[0] - 1, V[1]], [V[0] + 1, V[1]], [V[0], V[1] - 1], [V[0], V[1] + 1]]
                    return neighbor.filter(U => U[0] >= 0 && U[0] < N && U[1] >= 0 && U[1] < N && !visited[U[0]][U[1]])
                }

                let unvisitedNeighbor = getUnvisitedNeighbor(V)
                if (unvisitedNeighbor.length == 0) C = C.filter(e => e != V)
                else {
                    let chosenNeighbor = unvisitedNeighbor[getRandomInt(0, unvisitedNeighbor.length - 1)]
                    function removeWall(A, B) {
                        W.push([(A[0] + B[0]) / 2, (A[1] + B[1]) / 2])
                    }
                    removeWall(V, chosenNeighbor)
                    visited[chosenNeighbor[0]][chosenNeighbor[1]] = true
                    C.push(chosenNeighbor)
                }
            }

            let result = Array.from(new Array(2 * N + 1), () => (new Array(2 * N + 1)).fill(true))
            W.forEach(e => result[e[0] * 2 + 1][e[1] * 2 + 1] = false)
            for (let i = 0; i < 2 * N; i++) {
                for (let j = 0; j < 2 * N; j++) {
                    if (i % 2 == 1 && j % 2 == 1)
                        result[i][j] = false;
                }
            }

            let blockArray = []
            for (let i = 0; i < 2 * N + 1; i++) {
                for (let j = 0; j < 2 * N + 1; j++) {
                    if (result[i][j] == true) {
                        blockArray.push(new Block(new Position(new Coordinate(coordinate.x + i, coordinate.y, coordinate.z + j)), blockType))
                        blockArray.push(new Block(new Position(new Coordinate(coordinate.x + i, coordinate.y + 1, coordinate.z + j)), blockType))
                        blockArray.push(new Block(new Position(new Coordinate(coordinate.x + i, coordinate.y + 2, coordinate.z + j)), blockType))
                    }
                }
            }

            return blockArray

        }
    }
})