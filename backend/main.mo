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
    emoji: Text;
    inCart: Bool;
    completed: Bool;
  };

  stable var shoppingList: [ShoppingItem] = [];
  stable var nextId: Nat = 0;

  // Predefined items with emojis
  let predefinedItems: [(Text, Text)] = [
    ("Apples", "🍎"), ("Bananas", "🍌"), ("Carrots", "🥕"), ("Bread", "🍞"),
    ("Milk", "🥛"), ("Eggs", "🥚"), ("Cheese", "🧀"), ("Chicken", "🍗"),
    ("Pasta", "🍝"), ("Tomatoes", "🍅"), ("Onions", "🧅"), ("Potatoes", "🥔"),
    ("Cereal", "🥣"), ("Coffee", "☕")
  ];

  public func initialize() : async () {
    if (shoppingList.size() == 0) {
      for ((description, emoji) in predefinedItems.vals()) {
        ignore await addItem(description, emoji);
      };
    };
  };

  public func addItem(description: Text, emoji: Text) : async Nat {
    let id = nextId;
    nextId += 1;
    let newItem: ShoppingItem = {
      id;
      description;
      emoji;
      inCart = false;
      completed = false;
    };
    shoppingList := Array.append(shoppingList, [newItem]);
    Debug.print("Added item: " # debug_show(newItem));
    id
  };

  public query func getItems() : async [ShoppingItem] {
    shoppingList
  };

  public func toggleInCart(id: Nat) : async Bool {
    let index = Array.indexOf<ShoppingItem>({ id; description = ""; emoji = ""; inCart = false; completed = false }, shoppingList, func(a, b) { a.id == b.id });
    switch (index) {
      case null { false };
      case (?i) {
        let item = shoppingList[i];
        let updatedItem = {
          id = item.id;
          description = item.description;
          emoji = item.emoji;
          inCart = not item.inCart;
          completed = item.completed;
        };
        shoppingList := Array.tabulate(shoppingList.size(), func (j: Nat) : ShoppingItem {
          if (j == i) { updatedItem } else { shoppingList[j] }
        });
        Debug.print("Toggled inCart for item: " # debug_show(updatedItem));
        true
      };
    }
  };

  public func toggleCompleted(id: Nat) : async Bool {
    let index = Array.indexOf<ShoppingItem>({ id; description = ""; emoji = ""; inCart = false; completed = false }, shoppingList, func(a, b) { a.id == b.id });
    switch (index) {
      case null { false };
      case (?i) {
        let item = shoppingList[i];
        if (item.inCart) {
          let updatedItem = {
            id = item.id;
            description = item.description;
            emoji = item.emoji;
            inCart = item.inCart;
            completed = not item.completed;
          };
          shoppingList := Array.tabulate(shoppingList.size(), func (j: Nat) : ShoppingItem {
            if (j == i) { updatedItem } else { shoppingList[j] }
          });
          Debug.print("Toggled completed for item: " # debug_show(updatedItem));
          true
        } else {
          false
        }
      };
    }
  };

  public func deleteItem(id: Nat) : async Bool {
    let index = Array.indexOf<ShoppingItem>({ id; description = ""; emoji = ""; inCart = false; completed = false }, shoppingList, func(a, b) { a.id == b.id });
    switch (index) {
      case null { false };
      case (?i) {
        let item = shoppingList[i];
        if (item.inCart) {
          shoppingList := Array.filter(shoppingList, func(item: ShoppingItem) : Bool { item.id != id });
          Debug.print("Deleted item with id: " # Nat.toText(id));
          true
        } else {
          false
        }
      };
    }
  };
}