import { TouchableNativeFeedback, View } from 'react-native';
import { Text } from 'react-native-paper';
import { observer } from 'mobx-react-lite';

export function CourseInfo({ route, navigation }) {
  return (
    <View style={{ height: '100%' }}>
      <TouchableNativeFeedback
        onPress={() => {
          navigation.navigate('CourseStudents', {
            courseId: route.params.courseId,
          });
        }}
      >
        <View style={{ padding: 16 }}>
          <Text>Students</Text>
        </View>
      </TouchableNativeFeedback>
      <TouchableNativeFeedback
        onPress={() => {
          navigation.navigate('CourseClasses', {
            courseId: route.params.courseId,
          });
        }}
      >
        <View style={{ padding: 16 }}>
          <Text>Classes</Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
}

const CourseInfoWrapper = observer(CourseInfo);

export default CourseInfoWrapper;
