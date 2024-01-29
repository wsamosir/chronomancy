# chronomancy

This repo begin as a collection of shader experiments, mostly to practice glsl muscle again, but now I have decided that it is going to be an artwork: a frontend clock (or rather time) visualizer made out of glsl. The idea is to input second, time, all the way until the year as uniform into the shader and have each of them manifests as semantics; certain objects / characters / gestures. Last question is how to integrate an evolving heuristics into the clocks procedures + algorithms.

To install and run
```
git clone https://github.com/wsamosir/chronomancy
npm install
npm run watch
```

## TODO:
- add easing uniform that varies throughout different time groups of the day
- add another context that acts as the texture generator
- automate / standardize the placement of time uniform in all the programs