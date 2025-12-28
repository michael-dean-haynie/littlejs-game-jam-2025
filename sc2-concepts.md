# SC2 Concept Brainstorming

## References

- [SC2Mapster Wiki](https://sc2mapster.fandom.com/wiki/SC2Mapster_Wiki)
  - [Data Types](https://sc2mapster.fandom.com/wiki/Data_Types)
  - [Data Concepts](<https://sc2mapster.fandom.com/wiki/SC2Mapster_Wiki/Understand_the_Meta_Concept_of_Data_Editor_(A_Good_Starting_Point)>)
- [Starcraft II Editor Tutorials](https://s2editor-guides.readthedocs.io/)

## High Level Concepts

- Triggers
  - Events
  - Conditions
  - Actions
    - Can apply effects/behaviors

- Units
  - Main unit of interaction for game-play (manipulated by players)
  - Can use abilities, behaviors, and weapons

- [Abilities](https://sc2mapster.fandom.com/wiki/Data/Abilities)
  - Use effects, apply behaviors, create units, cause units to interact
  - Can be active/passive

- [Behaviors](https://sc2mapster.fandom.com/wiki/Data/Behaviors)
  - Use effects, apply weapons, modify units and a bunch of other stuff
  - Mostly for passive, effect-over-time, or buff/debuff is needed

- Weapons
  - Use effects, triggered by Attack ability
  - Can stand still, or strafe

- [Actors](https://sc2mapster.fandom.com/wiki/Data/Actors)
  - [Actor Computing Paradigm](https://en.wikipedia.org/wiki/Actor_model#Fundamental_concepts)
  - Abstract entity
  - The nerve cells of the the engine
  - SHOULD NOT AFFECT GAMEPLAY? (just art/sound?)
  - Everything is an actor, the game itself can be thought of as the "master actor"
  - Deals with art models, sounds, interaction amongst other actors
  - Can create other actors
  - Can send messaeges to other actors

- [Movers](https://sc2mapster.fandom.com/wiki/Data/Movers)
  - Determine pathing for "Move" ability/command
  - https://s2editor-guides.readthedocs.io/New_Tutorials/04_Data_Editor/059_Units/#movers
  - Ground/Fly/Burrow/Swim/CliffJump
