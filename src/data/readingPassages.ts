import type { ReadingPassage, KidName } from '../types'

const williamPassages: ReadingPassage[] = [
  {
    id: 'alex-1',
    title: 'The Red Balloon',
    content:
      'Sam had a red balloon. It was big and round. He took it to the park. A gust of wind came. The balloon flew up into the sky. Sam waved goodbye.',
    questions: [
      {
        id: 'q1',
        question: 'What color was the balloon?',
        choices: ['Blue', 'Red', 'Green', 'Yellow'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        question: 'Where did Sam take the balloon?',
        choices: ['School', 'The store', 'The park', 'Home'],
        correctIndex: 2,
      },
      {
        id: 'q3',
        question: 'What made the balloon fly away?',
        choices: ['A bird', 'A gust of wind', 'Sam let go', 'Rain'],
        correctIndex: 1,
      },
    ],
    kid: 'William',
    difficulty: 1,
  },
  {
    id: 'alex-2',
    title: 'Lily the Kitten',
    content:
      'Lily is a small kitten. She has soft, white fur. She likes to chase a ball of yarn. When she is tired, she curls up on the couch and purrs softly.',
    questions: [
      {
        id: 'q1',
        question: 'What is Lily?',
        choices: ['A puppy', 'A kitten', 'A bunny', 'A bird'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        question: 'What does Lily chase?',
        choices: ['Birds', 'Her tail', 'A ball of yarn', 'Mice'],
        correctIndex: 2,
      },
      {
        id: 'q3',
        question: 'Where does Lily sleep?',
        choices: ['On the couch', 'In a box', 'Under the bed', 'On a chair'],
        correctIndex: 0,
      },
    ],
    kid: 'William',
    difficulty: 1,
  },
  {
    id: 'alex-3',
    title: 'A Trip to the Zoo',
    content:
      'Max went to the zoo with his family. He saw tall giraffes eating leaves. He saw silly monkeys swinging from tree to tree. His favorite animal was the elephant. It was huge!',
    questions: [
      {
        id: 'q1',
        question: 'Who went to the zoo?',
        choices: ['Max', 'Sam', 'Leo', 'Tom'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        question: 'What were the giraffes doing?',
        choices: ['Sleeping', 'Eating leaves', 'Running', 'Drinking water'],
        correctIndex: 1,
      },
      {
        id: 'q3',
        question: "What was Max's favorite animal?",
        choices: ['Giraffe', 'Monkey', 'Elephant', 'Lion'],
        correctIndex: 2,
      },
    ],
    kid: 'William',
    difficulty: 2,
  },
  {
    id: 'alex-4',
    title: 'Rainy Day Fun',
    content:
      'It was raining outside. Emma could not go to the park. She built a fort with blankets and chairs. She read books inside her cozy fort all afternoon.',
    questions: [
      {
        id: 'q1',
        question: 'Why could Emma not go to the park?',
        choices: ['She was sick', 'It was raining', 'The park was closed', 'She was busy'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        question: 'What did Emma build?',
        choices: ['A house', 'A fort', 'A castle', 'A tent'],
        correctIndex: 1,
      },
      {
        id: 'q3',
        question: 'What did Emma do in the fort?',
        choices: ['Napped', 'Played games', 'Read books', 'Ate snacks'],
        correctIndex: 2,
      },
    ],
    kid: 'William',
    difficulty: 2,
  },
  {
    id: 'alex-5',
    title: 'Baking Cookies',
    content:
      'Mom and Dad were baking cookies. The kitchen smelled like vanilla and chocolate. They put the cookies in the oven. After ten minutes, the cookies were golden brown and ready to eat.',
    questions: [
      {
        id: 'q1',
        question: 'What did Mom and Dad bake?',
        choices: ['Cake', 'Cookies', 'Bread', 'Pizza'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        question: 'What did the kitchen smell like?',
        choices: ['Vanilla and chocolate', 'Flowers', 'Fruit', 'Spices'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        question: 'How long did the cookies bake?',
        choices: ['Five minutes', 'Ten minutes', 'Twenty minutes', 'Thirty minutes'],
        correctIndex: 1,
      },
    ],
    kid: 'William',
    difficulty: 3,
  },
]

const cloverPassages: ReadingPassage[] = [
  {
    id: 'maya-1',
    title: 'The Invention of the Telephone',
    content:
      'Alexander Graham Bell is credited with inventing the first practical telephone in 1876. However, the idea of transmitting voice over wires had been explored by several inventors. Bell\'s breakthrough came when he realized that sound waves could be converted into electrical signals and transmitted over a wire. His famous first words spoken through the device were, "Mr. Watson, come here, I want to see you." This invention revolutionized communication, shrinking the world and enabling instant long-distance conversations.',
    questions: [
      {
        id: 'q1',
        question: 'In what year was the telephone invented?',
        choices: ['1865', '1876', '1880', '1892'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        question: "What was Bell's key realization?",
        choices: [
          'That electricity could power machines',
          'That sound waves could become electrical signals',
          'That wires could carry water',
          'That voices could travel through air',
        ],
        correctIndex: 1,
      },
      {
        id: 'q3',
        question: 'What does the passage suggest about the invention?',
        choices: [
          'It was immediately popular worldwide',
          'It made long-distance communication possible',
          'It was invented by multiple people at once',
          'It was only used by scientists',
        ],
        correctIndex: 1,
      },
    ],
    kid: 'Clover',
    difficulty: 1,
  },
  {
    id: 'maya-2',
    title: 'The Coral Reef Ecosystem',
    content:
      'Coral reefs are among the most biodiverse ecosystems on Earth, often called the "rainforests of the sea." Despite covering less than 1% of the ocean floor, they support approximately 25% of all marine species. Coral itself is not a plant but a colony of tiny animals called polyps. These polyps have a symbiotic relationship with algae living inside them. The algae provide nutrients through photosynthesis, while the coral offers the algae a protected home. However, rising ocean temperatures and pollution threaten these delicate ecosystems.',
    questions: [
      {
        id: 'q1',
        question: 'Why are coral reefs called "rainforests of the sea"?',
        choices: [
          'Because they are found in warm water',
          'Because of their high biodiversity',
          'Because they are colorful',
          'Because they are endangered',
        ],
        correctIndex: 1,
      },
      {
        id: 'q2',
        question: 'What is coral, according to the passage?',
        choices: ['A plant', 'A type of rock', 'A colony of tiny animals', 'A type of algae'],
        correctIndex: 2,
      },
      {
        id: 'q3',
        question: 'What does the algae provide to the coral?',
        choices: ['Oxygen', 'Nutrients through photosynthesis', 'Color', 'Protection from predators'],
        correctIndex: 1,
      },
    ],
    kid: 'Clover',
    difficulty: 1,
  },
  {
    id: 'maya-3',
    title: 'The Art of Origami',
    content:
      'Origami, the Japanese art of paper folding, dates back to the 6th century when paper was introduced to Japan from China. Originally, origami was used in religious ceremonies and was considered a formal art form reserved for the wealthy, as paper was expensive. Over centuries, it evolved into a popular recreational activity. Modern origami has even influenced science and engineering: researchers have used folding principles to design compact solar panels for satellites and self-folding robots. The famous Japanese crane, or "tsuru," is a symbol of peace and longevity.',
    questions: [
      {
        id: 'q1',
        question: 'When did origami originate in Japan?',
        choices: ['4th century', '6th century', '10th century', '12th century'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        question: 'Why was origami originally for the wealthy?',
        choices: ['It was difficult', 'Paper was expensive', 'It was sacred', 'Only nobles knew how'],
        correctIndex: 1,
      },
      {
        id: 'q3',
        question: 'How has origami influenced modern science?',
        choices: [
          'It inspired new medicines',
          'It helped design folding technologies',
          'It created new materials',
          'It improved telescopes',
        ],
        correctIndex: 1,
      },
    ],
    kid: 'Clover',
    difficulty: 2,
  },
  {
    id: 'maya-4',
    title: 'The Water Cycle',
    content:
      'The water cycle, also known as the hydrologic cycle, is the continuous movement of water on, above, and below the surface of the Earth. The cycle involves several key processes: evaporation, where the sun heats water and turns it into vapor; condensation, where vapor cools and forms clouds; precipitation, where water falls as rain or snow; and collection, where water gathers in oceans, rivers, and underground reservoirs. This cycle has been operating for billions of years and is essential for sustaining all life on Earth. Without it, freshwater would not be replenished.',
    questions: [
      {
        id: 'q1',
        question: 'What drives evaporation in the water cycle?',
        choices: ['Wind', 'Gravity', 'The sun', 'Clouds'],
        correctIndex: 2,
      },
      {
        id: 'q2',
        question: 'What happens during condensation?',
        choices: [
          'Water falls as rain',
          'Vapor forms clouds',
          'Water evaporates',
          'Water collects underground',
        ],
        correctIndex: 1,
      },
      {
        id: 'q3',
        question: 'Why is the water cycle essential for life?',
        choices: [
          'It creates weather',
          'It replenishes freshwater',
          'It cools the Earth',
          'It produces oxygen',
        ],
        correctIndex: 1,
      },
    ],
    kid: 'Clover',
    difficulty: 3,
  },
]

export function getPassagesForKid(kid: KidName): ReadingPassage[] {
  return kid === 'William' ? williamPassages : cloverPassages
}

export function getPassageById(id: string): ReadingPassage | undefined {
  return [...williamPassages, ...cloverPassages].find(p => p.id === id)
}
