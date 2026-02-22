import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import { semanticColors } from '../theme/semanticColors';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  color?: string;
}

interface MenuActionSheetProps {
  actionSheetRef: React.RefObject<ActionSheetRef>;
  onSignOut: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress, color = semanticColors.buttonPrimary }) => (
  <TouchableOpacity style={styles.menuGridItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={styles.menuGridText}>{label}</Text>
  </TouchableOpacity>
);

const MenuActionSheet: React.FC<MenuActionSheetProps> = ({ actionSheetRef, onSignOut }) => {
  const menuItems: MenuItemProps[][] = [
    [
      { icon: "cash-outline", label: "Deposite" },
      { icon: "diamond-outline", label: "Points" },
      { icon: "notifications-outline", label: "Notifications" },
      { icon: "person-outline", label: "Profile" },
    ],
    [
      { icon: "settings-outline", label: "Settings" },
      { icon: "help-circle-outline", label: "Support" },
      { icon: "gift-outline", label: "Referral" },
      { icon: "document-text-outline", label: "History" },
    ],
  ];

  return (
    <ActionSheet ref={actionSheetRef}>
      <View style={styles.container}>
        {menuItems.map((group, index) => (
          <View key={index} style={styles.menuGrid}>
            {group.map((item) => (
              <MenuItem key={item.label} {...item} />
            ))}
          </View>
        ))}
        <TouchableOpacity
          style={[styles.menuItem, styles.signOutButton]}
          onPress={onSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color="red" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ActionSheet>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 10 
  },
  menuGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginVertical: 10 
  },
  menuGridItem: { 
    alignItems: 'center', 
    width: '25%', 
    marginVertical: 10 
  },
  menuGridText: { 
    marginTop: 5, 
    fontSize: 12, 
    color: semanticColors.textSecondary 
  },
  menuItem: { 
    paddingVertical: 0, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  signOutButton: { 
    marginTop: 10, 
    borderTopWidth: 1, 
    justifyContent: 'center', 
    borderTopColor: semanticColors.divider, 
    paddingTop: 20 
  },
  signOutText: { 
    color: semanticColors.dangerText, 
    marginLeft: 10 
  },
});

export default MenuActionSheet;