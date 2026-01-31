import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import MeetDetailsScreen from "@/screens/MeetDetailsScreen";
import EventDetailsScreen from "@/screens/EventDetailsScreen";
import LiveRaceScreen from "@/screens/LiveRaceScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Meet } from "@/types/swim";

export type RootStackParamList = {
  Main: undefined;
  MeetDetails: { meet: Meet };
  EventDetails: {
    meetId: string;
    eventNumber: number;
    meetSource: "swimlane" | "swimify";
  };
  LiveRace: {
    meetId: string;
    eventNumber: number;
    heatNumber: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MeetDetails"
        component={MeetDetailsScreen}
        options={({ route }) => ({
          headerTitle: route.params.meet.name,
          headerBackTitle: "Tilbake",
        })}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{
          headerTitle: "Øvelse",
          headerBackTitle: "Tilbake",
        }}
      />
      <Stack.Screen
        name="LiveRace"
        component={LiveRaceScreen}
        options={{
          headerTitle: "Live",
          headerBackTitle: "Tilbake",
        }}
      />
    </Stack.Navigator>
  );
}
