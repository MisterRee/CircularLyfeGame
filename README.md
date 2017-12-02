# CircularLyfeGame
Developed off of the lessons learned from [CellularAutomata](https://github.com/MisterRee/CellularAutomata)
A javascript browser based example of cellular automata, remixed with a new circular flavor and rules. Light audio and interactivity added in.

[Github Pages Demo](https://misterree.github.io/CircularLyfeGame/)

To stay faithful to the philosophy of the [Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life), the processes used are complicated to comprehend but are simple in design. Each layer of nodes has different spin rates and frequencies of lifecycle calculation. The ratio depends on how many nodes are within a layer; the more nodes, the faster the spin and calculation rates. The number of nodes increases with the [Fibbonachi Sequence](https://en.wikipedia.org/wiki/Fibonacci_number).

Neighbor calculation varies. There are the obvious two neighbors within the same node layers, but the neighbor detection reaches out to any adjacent node layers as well. To see this process, click on the middle circle and toggle the button with 'minim' until it displays 'all'.

The rules of this iteration is simplified to the following:

> Any cell with exactly two living neighbors will be set to a living state.

> Any cell with more than two living neighbors will be set to a dead state.

The audio (which can be toggled on by clicking the center circle and toggling off the "mute" button) is triggered every time a node layer's life calculation runs. Each node that is alive in the node increases the pitch of the sound played. The sound is calculated various ways.

> The first node layer has a base frequency of 55 hertz, which is roughly a low note of 'C'

> Increasing node layers will generate with a base frequency that increases exponentially by a factor of 2.

> Each living node will increase the pitch by a step by that layer.

> If the number of nodes exceeds the number of steps required to move the pitch up an octive, each living node in said layer will increase the pitch by only a fraction of a step.

The 'floaters' or little colored arcs is generated every time a sound is played. Color is randomized, and the angle of the floater arc is respective to the node layer it is associated to.

A person viewing this can stretch out the radius of the experience with mouse drags from towards or away the center of the canvas. This effects the volume of audio being played, and the speed of which floaters travel away from the center.

Lastly to note the whole experience runs on a frame engine, which calculates how quickly the window is finishes functions. Most movements are scaled based on time passed, irrelevant of how many frames the window can generate. However more frames will make the visually look smoother.
