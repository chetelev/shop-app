import {Recipe} from './recipe.model';
import {EventEmitter, Injectable} from '@angular/core';
import {Ingredient} from '../shared/ingredient.model';
import {ShoppingListService} from '../shopping-list/shopping-list.service';

@Injectable()
export class RecipeService {
  recipeSelected = new EventEmitter<Recipe>();
  private recipes: Recipe[] = [

    new Recipe('Burger', 'This is simply a test',
      'https://assets3.thrillist.com/v1/image/2848840/size/gn-gift_guide_variable_c.jpg',
      [new Ingredient('Meat', 1),
        new Ingredient('French Fries', 20)]),

    new Recipe('Pasta', 'This is simply a test',
      'https://spanishsabores.com/wp-content/uploads/2019/01/DSC07278.jpg',
      [new Ingredient('Maccaroni', 1),
        new Ingredient('Cheese', 100)])
  ];

  constructor(private shoppingListService: ShoppingListService) {
  }

  getRecipes() {
    return this.recipes.slice();
  }

  getIngredients(ingredients: Ingredient[]) {
    this.shoppingListService.addIngredients(ingredients);
  }

  getRecipe(index: number) {
    return this.recipes[index];
  }

}
