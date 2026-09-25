import { categories } from "./categories";


export function createTaskRewards(
  selectedCategories: string[]
) {
  return selectedCategories.map((categoryName) => {

    const category = categories.find(
      (category) =>
        category.name === categoryName
    );


    return {
      category: categoryName,
      xp: category?.xp ?? 0,
    };

  });
}