import { inject } from "inversify";
import { Autoloadable } from "../../core/autoload/autoloadable";
import type { ILJS } from "../../littlejsengine/littlejsengine.impure";
import type { IUnit } from "../../units/unit.types";
import {
  AbilityCtorMap,
  type Ability,
  type IAbility,
} from "../abilities.types";
import {
  ABILITY_FACTORY_TOKEN,
  type IAbilityFactory,
} from "./ability-factory.types";
import { LJS_TOKEN } from "../../littlejsengine/littlejsengine.token";

@Autoloadable({
  serviceIdentifier: ABILITY_FACTORY_TOKEN,
})
export class AbilityFactory implements IAbilityFactory {
  private readonly _ljs: ILJS;

  constructor(@inject(LJS_TOKEN) ljs: ILJS) {
    this._ljs = ljs;
  }

  createAbility(ability: Ability, unit: IUnit): IAbility {
    return new AbilityCtorMap[ability](unit, this._ljs);
  }
}
