import { systemInstance as system, Description, Usage, Block, Coordinate, Position, BlockType, BuildInstruction, canonicalGeneratorFactory } from 'norma-core';
import { utils } from '../utils'
import { Midi } from '@tonejs/midi'

/*system.registerCanonicalGenerator({
    description: new Description("NZ IS JUJUJUJULAO", new Usage([], [], [], [])),
    criteria: { positionArrayLength: 1, blockTypeArrayLength: 0, directionArrayLength: 0 },
    option: { },
    method: {
        generate: async function (e) {
            const { logger, file, sendRequest } = e.runtime
            const position = e.state.positions[0]

            await sendRequest({ type: "picture", data: { position } })

            // const fi = file.open(`plugins/0_0.jpg`, file.ReadMode, true)
            // const image = await Image.load(fi.readAllSync())
            // const pixels = image.getPixelsArray()
            // const blockArray = pixels.map((p, i) => {
            //     const woolPalette = {
            //         "white": [233, 236, 236],
            //         "orange": [240, 118, 19],
            //         "magenta": [240, 118, 19],
            //         "light_blue": [58, 175, 217],
            //         "yellow": [248, 198, 39],
            //         "lime": [112, 185, 25],
            //         "pink": [237, 141, 172],
            //         "gray": [62, 68, 71],
            //         "silver": [142, 142, 134],
            //         "cyan": [21, 137, 145],
            //         "purple": [121, 42, 172],
            //         "blue": [53, 57, 157],
            //         "brown": [114, 71, 40],
            //         "green": [84, 109, 27],
            //         "red": [161, 39, 34],
            //         "black": [20, 21, 25]
            //     }
            //     const res = Object.entries(woolPalette).reduce((pre, cur) => {
            //         function colorDistance(a, b) {
            //             return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2]))
            //         }
            //         return colorDistance(p, pre[1]) < colorDistance(p, cur[1]) ? pre : cur
            //     })
            //     return new Block(
            //         new Position(
            //             new Coordinate(position.coordinate.x + i % image.width, position.coordinate, y, position.coordinate.z + Math.floor(i / width)),
            //             position.dimension
            //         ),
            //         new BlockType("minecraft:wool", {
            //             "color": res[0]
            //         })
            //     )
            // })
        }
    }
})*/

function deepEqual(a, b) {
    return a === b || (a && b && typeof a === "object" && typeof b === "object" && Object.keys(a).length === Object.keys(b) && Object.keys(a).every((property) => deepEqual(a[property], b[property])))
}
system.registerCanonicalGenerator({
    description: new Description("NZ IS JULAO", new Usage([], [], [], [
        {
            viewtype: "button",
            text: "Set direction.",
            key: "facingAxis",
            data: [
                { value: "-z", text: "-z" },
                { value: "+z", text: "+z" },
                { value: "+x", text: "+x" },
                { value: "-x", text: "-x" }
            ]
        },
        {
            viewtype: "edittext",
            text: "Tick of section(Affects the distance between two nodes. Must not equal or below 12!):",
            key: "tickOfSection",
        },
        {
            viewtype: "edittext",
            text: "Time for each eighth note in seconds(Controls the speed. Advised to be a multiple of 0.2!):",
            key: "SECOND_PER_EIGHTH_NOTE",
            inputType: "float"
        },
        {
            viewtype: "edittext",
            text: "Song name:",
            key: "song_name",
            inputType: "string"
        }

    ])),
    criteria: { positionArrayLength: 1, blockTypeArrayLength: 0, directionArrayLength: 0 },
    option: { "facingAxis": "+x", "tickOfSection": 16, "SECOND_PER_EIGHTH_NOTE": 0.2, "song_name": "Bad_Apple_faster" },
    method: {
        UIHandler: function () { }, generate: function (e) {
            const { logger, file } = e.runtime
            const positionArray = e.state.positions

            const { facingAxis } = e.state
            let blockArray = []

            const songs = ((songName) => {
                log(songName)
                const REDSTONE_TICKS_PER_SECOND_IN_MINECRAFT = 10

                const fi = file.open(`plugins/${songName}.mid`, file.ReadMode, true)

                // const midi = new Midi(midiData)


                const midiData = fi.readAllSync()
                const midi = new Midi(midiData)
                fi.close()
                let songs = []
                for (let trackNumber = 0; trackNumber < midi.tracks.length; trackNumber++) {
                    logger.log("verbose", "NZ IS JULAO!")
                    const track = midi.tracks[trackNumber];
                    const tickOfSection = e.state.tickOfSection

                    let song = {
                        name: `${songName}_${trackNumber.toString()}`,
                        instrument_name: track.instrument.name,
                        tickOfSection,
                        score: [[]]
                    }
                    const notes = track.notes
                    if (notes.length == 0) continue


                    function getPitchAndInstrument(noteName) {

                        const octave = noteName.slice(-1)
                        const note = noteName.slice(0, -1)


                        let pitch//Equals to the times you have to click on the note block in F#3-F#5
                        const pitchMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
                        pitch = pitchMap.lastIndexOf(note) - 6 + (octave - 3) * 12

                        return {
                            pitch,
                            instrument: ""
                        }
                    }

                    for (let note of notes) {
                        const [bar, noteName] = [note.bars, note.name]
                        const SECOND_PER_EIGHTH_NOTE = e.state.SECOND_PER_EIGHTH_NOTE
                        const REDSTONE_TICKS_PER_EIGHTH_NOTE = SECOND_PER_EIGHTH_NOTE * REDSTONE_TICKS_PER_SECOND_IN_MINECRAFT //tempo
                        const ordinalOfEighthNote = bar * midi.header.timeSignatures[0].timeSignature[0] * (8 / midi.header.timeSignatures[0].timeSignature[1])
                        while ((song.score.length) * song.tickOfSection <= ordinalOfEighthNote * REDSTONE_TICKS_PER_EIGHTH_NOTE) song.score.push([])
                        if (ordinalOfEighthNote * REDSTONE_TICKS_PER_EIGHTH_NOTE - Math.floor(ordinalOfEighthNote * REDSTONE_TICKS_PER_EIGHTH_NOTE) < 0.001) {
                            song.score[song.score.length - 1].push({
                                ...getPitchAndInstrument(noteName),
                                tickOffset: ordinalOfEighthNote * REDSTONE_TICKS_PER_EIGHTH_NOTE - (song.score.length - 1) * song.tickOfSection
                            })
                        }
                    }
                    songs.push(song)
                }





                return songs
            })(e.state.song_name);
            logger.logObject("verbose", songs)

            file.writeTo('plugins/123.json', JSON.stringify(songs))



            songs.forEach((song, index) => {
                const tickOfSection = song.tickOfSection
                const branch_direction = index % 2 == 0 ? "-z" : "+z"
                logger.log("verbose", "NZ IS JULAO!")

                function generateBlocksPerSection(coordinate, section) {
                    logger.log("verbose", "NZ IS JUJUJUJUJULAO!")
                    function setNoteBlock(coordinate, note) {
                        logger.log("verbose", "Oh...NZ IS JULAO!")
                        let { pitch, instrument } = note
                        blockArray.push(new Block(new Position(new Coordinate(coordinate.x, coordinate.y, coordinate.z), positionArray[0].dimension),
                            new BlockType("minecraft:command_block", {},
                                `{"Command":"/execute @a ~ ~ ~ playsound note.harp @s ~~~ 1 ${Math.pow(2, pitch / 12 - 1)} ","CustomName":"","ExecuteOnFirstTick":0b,"LPCommandMode":0,"LPCondionalMode":0b,"LPRedstoneMode":0b,"LastExecution":0l,"LastOutput":"","LastOutputParams":[],"SuccessCount":0,"TickDelay":0,"TrackOutput":1b,"Version":15,"auto":0b,"conditionMet":0b,"id":"CommandBlock","isMovable":1b,"powered":0b,"x":522,"y":71,"z":-1}`)
                        ))

                    }
                    function setBedBlock(coordinate) {
                        blockArray.push(new Block(new Position(coordinate, positionArray[0].dimension), new BlockType("minecraft:grass", {})))
                    }
                    function setRepeater(coordinate, delay, direction) {
                        setBedBlock(new Coordinate(coordinate.x, coordinate.y - 1, coordinate.z))
                        blockArray.push(new Block(
                            new Position(coordinate, positionArray[0].dimension),
                            utils.blockGeometry.setBlockDirection(new BlockType("minecraft:unpowered_repeater", { repeater_delay: delay, direction: 0 }), direction)
                        ))
                    }
                    function setRedstoneDust(coordinate) {
                        setBedBlock(new Coordinate(coordinate.x, coordinate.y - 1, coordinate.z))
                        blockArray.push(new Block(
                            new Position(coordinate, positionArray[0].dimension),
                            new BlockType("minecraft:redstone_wire", { redstone_signal: 0 })
                        ))
                    }
                    function setRedstoneMechanism(coordinate, delay, direction) {
                        if (delay > 0) setRepeater(coordinate, delay - 1, direction)
                        else setRedstoneDust(coordinate)
                    }

                    let offset_x = 0
                    logger.log("verbose", "Yes, NZ IS JULAO!")

                    for (let tick = 0; tick < tickOfSection;) {
                        if (tickOfSection - tick >= 4) {
                            setRedstoneMechanism(new Coordinate(coordinate.x + offset_x, coordinate.y, coordinate.z), 4, "-x")
                            tick += 4
                        }
                        else {
                            setRedstoneMechanism(new Coordinate(coordinate.x + offset_x, coordinate.y, coordinate.z), tickOfSection - tick, "-x")
                            tick = tickOfSection
                        }
                        offset_x++;
                    }
                    setRedstoneDust(new Coordinate(coordinate.x + offset_x, coordinate.y, coordinate.z))

                    function generateNoteBlocks(coordinate, section) {

                        let lastTick = 0
                        section.sort((a, b) => { return a.tickOffset < b.tickOffset })
                        function sign(branch_direction) { return branch_direction == "-z" ? -1 : 1 }

                        let oppositeDirection = (branch_direction == "+z" ? "-z" : "+z")

                        let offset_z = 1;
                        for (let note of section) {
                            note.tickOffset = Math.floor(note.tickOffset)
                            if (note.tickOffset == lastTick) {
                                setRedstoneDust(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z))
                                offset_z++
                                setRedstoneDust(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z))
                                setRedstoneDust(new Coordinate(coordinate.x - 1, coordinate.y, coordinate.z + sign(branch_direction) * offset_z))
                                setNoteBlock(new Coordinate(coordinate.x - 2, coordinate.y, coordinate.z + sign(branch_direction) * offset_z), note)
                            }
                            else {
                                for (let tick = 0; tick < note.tickOffset - lastTick;) {
                                    if (note.tickOffset - lastTick - tick >= 4) {
                                        setRedstoneMechanism(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z), 4, oppositeDirection)
                                        tick += 4
                                    }
                                    else {
                                        setRedstoneMechanism(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z), note.tickOffset - lastTick - tick, oppositeDirection)
                                        tick = note.tickOffset - lastTick
                                    }
                                    offset_z++;
                                }
                                setNoteBlock(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z), note)
                            }
                            // setRedstoneMechanism(new Coordinate(coordinate.x, coordinate.y, coordinate.z + offset_z), note.tickOffset - lastTick, "-z")
                            lastTick = note.tickOffset
                            logger.log("verbose", "So...NZ IS JULAO!")
                            offset_z++
                        }
                    }

                    generateNoteBlocks(new Coordinate(coordinate.x + offset_x, coordinate.y, coordinate.z), section)
                    offset_x++
                    return offset_x;
                }
                let offset_x = 0
                const startCoordinate = positionArray[0].coordinate

                for (let score of song.score) {

                    offset_x += generateBlocksPerSection(new Coordinate(startCoordinate.x + offset_x, startCoordinate.y, startCoordinate.z), score)
                }
            })

            let transform = (function (facingAxis) {
                switch (facingAxis) {
                    case "+x": {
                        return utils.coordinateGeometry.transform(
                            (x, y, z) => x,
                            (x, y, z) => y,
                            (x, y, z) => z
                        )
                    }
                    case "-x": {
                        return utils.coordinateGeometry.transform(
                            (x, y, z) => 2 * positionArray[0].coordinate.x - x,
                            (x, y, z) => y,
                            (x, y, z) => 2 * positionArray[0].coordinate.z - z
                        )
                    }
                    case "+z": {
                        return utils.coordinateGeometry.transform(
                            (x, y, z) => positionArray[0].coordinate.x - (z - positionArray[0].coordinate.z),
                            (x, y, z) => y,
                            (x, y, z) => positionArray[0].coordinate.z + (x - positionArray[0].coordinate.x)
                        )
                    }
                    case "-z": {
                        return utils.coordinateGeometry.transform(
                            (x, y, z) => positionArray[0].coordinate.x + (z - positionArray[0].coordinate.z),
                            (x, y, z) => y,
                            (x, y, z) => positionArray[0].coordinate.z - (x - positionArray[0].coordinate.x)
                        )
                    }
                }
            }(facingAxis))


            let blockTransform = function (blockType) {
                if (!utils.blockGeometry.hasBlockDirection(blockType)) return blockType
                const axis = ["+x", "+z", "-x", "-z"]
                log(utils.blockGeometry.getBlockDirection(blockType))
                let blockAxis = (function (direction) {
                    if (-45 <= direction && direction <= 45) return "+z"
                    else if (-135 <= direction && direction <= -45) return "+x"
                    else if (45 <= direction && direction <= 135) return "-x"
                    else return "-z"
                })(utils.blockGeometry.getBlockDirection(blockType).y)

                let newBlockAxis = axis[(axis.indexOf(blockAxis) + axis.indexOf(facingAxis) - axis.indexOf("+x")) % axis.length]
                log({ blockAxis, newBlockAxis }, { newBlockType: utils.blockGeometry.setBlockDirection(blockType, newBlockAxis) })
                return utils.blockGeometry.setBlockDirection(blockType, newBlockAxis)
            }

            blockArray = blockArray.map((block) => {

                return new Block(new Position(transform(block.position.coordinate), block.position.dimension), blockTransform(block.blockType))
            })


            // throw "123"
            return blockArray
        }
    }
})

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
                    let chosenNeighbor = unvisitedNeighbor[getRandomInt(0, unvisitedNeighbor.length)]
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

