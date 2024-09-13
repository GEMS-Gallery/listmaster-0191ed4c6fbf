import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ShoppingItem {
  'id' : bigint,
  'completed' : boolean,
  'description' : string,
  'emoji' : string,
  'inCart' : boolean,
}
export interface _SERVICE {
  'addItem' : ActorMethod<[string, string], bigint>,
  'deleteItem' : ActorMethod<[bigint], boolean>,
  'getItems' : ActorMethod<[], Array<ShoppingItem>>,
  'initialize' : ActorMethod<[], undefined>,
  'toggleCompleted' : ActorMethod<[bigint], boolean>,
  'toggleInCart' : ActorMethod<[bigint], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
