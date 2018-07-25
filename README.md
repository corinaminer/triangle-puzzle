# Triangle puzzle
This repository contains the infrastructure I've assembled to document solutions to my triangle puzzle. The idea of the puzzle is to fit the 12 pieces into a given frame. I've called it the triangle puzzle because each piece can be constructed out of 6 equilateral triangles. The individual pieces, and a picture of one example solution, can be found in the `assets/` folder.

I've had this puzzle for most of my life, and started informally documenting solutions around 2002. I have never spontaneously arrived at a solution I had already found and documented, so I've gotten more and more curious how many solutions actually exist.

Many solutions have sister solutions reachable by flipping or rotating two or three pieces that form a symmetric shape. I've identified these groups by providing both an ID and a sub-ID for each solution; solutions in a sister group share an ID. I don't have a formal definition of how major a transformation has to be to qualify as a new solution instead of a sister solution: but ultimately it doesn't really matter if you just want to know how many unique solutions there are.

## Computational approaches
If you are interested in finding all solutions to this puzzle computationally, feel free to use the resources from this repository. You may also find [solvin-da-puzzle](https://github.com/BenEgeIzmirli/solvin-da-puzzle) useful; it is a theoretically complete project to compute all solutions to this puzzle, but is too inefficient to produce any in practice. I am interested to know how many solutions exist (contact me for starting ideas if you decide to take this on!), but please do not use this repo as your workspace and please do not flood `solutions.csv` with computer-generated solutions -- I'd like to slowly fill that thing out with my own blood, sweat, and tears.

## ...manual approaches?
If (heaven forbid) you find yourself compelled to solve this puzzle manually without the physical thing at your fingertips, feel free to add your solutions to `solutions.csv`. I just hope your name doesn't contain commas.
