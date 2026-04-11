import { View } from 'react-native';

// 這是一個空元件，用來讓 TabLayout 認識 "create" 這個實體 Tab，
// 因為我們在 _layout.jsx 的 tabBarButton 攔截了點擊事件，所以這頁永遠不會真的渲染出來。
export default function CreatePlaceholder() {
  return <View />;
}
