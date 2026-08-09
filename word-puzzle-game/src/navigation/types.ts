export type RootStackParamList = {
  Home: undefined;
  LevelSelect: undefined;
  Gameplay: { levelId: number };
  Pause: { levelId: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
