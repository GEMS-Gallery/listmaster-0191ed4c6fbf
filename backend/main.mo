import Bool "mo:base/Bool";
import List "mo:base/List";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";

actor {
  public type ShoppingItem = {
    id: Nat;
    description: Text;
    completed: Bool;
  };

  stable var shoppingList: [ShoppingItem] = [];
  stable var nextId: Nat = 0;

  // Predefined items
  let predefinedItems: [Text] = [
    "Apples", "Bananas", "Carrots", "Bread", "Milk", "Eggs", "Cheese",
    "Chicken", "Pasta", "Tomatoes", "Onions", "Potatoes", "Cereal", "Coffee"
  ];

  public func initialize() : async () {
    if (shoppingList.size() == 0) {
      for (item in predefinedItems.vals()) {
        ignore await addItem(item);
      };
    };
  };

  public func addItem(description: Text) : async Nat {
    let id = nextId;
    nextId += 1;
    let newItem: ShoppingItem = {
      id;
      description;
      completed = false;
    };
    shoppingList := Array.append(shoppingList, [newItem]);
    Debug.print("Added item: " # debug_show(newItem));
    id
  };

  public query func getItems() : async [ShoppingItem] {
    shoppingList
  };

  public func toggleItem(id: Nat) : async Bool {
    let index = Array.indexOf<ShoppingItem>({ id; description = ""; completed = false }, shoppingList, func(a, b) { a.id == b.id });
    switch (index) {
      case null { false };
      case (?i) {
        let item = shoppingList[i];
        let updatedItem = {
          id = item.id;
          description = item.description;
          completed = not item.completed;
        };
        shoppingList := Array.tabulate(shoppingList.size(), func (j: Nat) : ShoppingItem {
          if (j == i) { updatedItem } else { shoppingList[j] }
        });
        Debug.print("Toggled item: " # debug_show(updatedItem));
        true
      };
    }
  };

  public func deleteItem(id: Nat) : async Bool {
    let newList = Array.filter(shoppingList, func(item: ShoppingItem) : Bool { item.id != id });
    if (newList.size() < shoppingList.size()) {
      shoppingList := newList;
      Debug.print("Deleted item with id: " # Nat.toText(id));
      true
    } else {
      false
    }
  };
}