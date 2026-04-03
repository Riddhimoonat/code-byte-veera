declare module '@react-navigation/bottom-tabs' {
  import { 
    BottomTabNavigationOptions, 
    BottomTabNavigationProp 
  } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
  import { TabNavigationState, ParamListBase, TypedNavigator } from '@react-navigation/native';
  import { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs/lib/typescript/src/types';

  export function createBottomTabNavigator<
    ParamList extends ParamListBase = ParamListBase
  >(): TypedNavigator<
    ParamList,
    TabNavigationState<ParamList>,
    BottomTabNavigationOptions,
    BottomTabNavigationEventMap,
    typeof createBottomTabNavigator
  >;
}
