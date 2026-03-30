# Signs Detection Dictionary

This application has been upgraded to support at least 50 different sign language gestures and can detect multiple gestures if both hands are present!

Here is the complete list of the 50 signs the custom machine learning model is configured to detect:

| Category | Signs |
| -------- | ----- |
| **Greetings & Pleasantries** | Hello, Goodbye, Welcome, Please, Thank You, Sorry, Nice |
| **Common Responses** | Yes, No, Help, More, All Done, Good, Bad |
| **Basic Needs & State** | Eat, Drink, Water, Milk, Sleep, Toilet, Play, Hot, Cold, Happy, Sad, Angry |
| **Actions** | Stop, Go, Come |
| **Family / People** | Mother, Father, Baby, Friend |
| **Places / Items** | Home, School, Work, Book |
| **Animals** | Cat, Dog |
| **Expressions** | I Love You, Peace |
| **Numbers (1-10)** | One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten |

*Note: For the best detection accuracy, you must first train the model with your own hands by running `python tools/train-asl/capture_dataset.py` followed by `python tools/train-asl/train_asl.py`!*
