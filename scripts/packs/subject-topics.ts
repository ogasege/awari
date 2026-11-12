/**
 * Curated article lists for the nine subject packs (15-subject-packs).
 * Each title is a Simple English Wikipedia article. `photoQuery` is a
 * Commons search phrase tried after the article's own files, and `event`
 * marks an article whose Wikidata date also becomes a timeline event
 * (18-world-timeline). `scripts/packs/curate.ts` checks every candidate
 * (text length, quiz, photo); the build uses the first TARGET that pass,
 * in list order, and fails if a pack falls short.
 */
import type { SubjectPackId } from '../../src/lib/packs/subjects.ts';
import type { EventKind } from './timeline.ts';

export interface SubjectTopic {
  title: string;
  photoQuery?: string;
  event?: EventKind;
}

const t = (title: string, photoQuery?: string, event?: EventKind): SubjectTopic => ({
  title,
  ...(photoQuery ? { photoQuery } : {}),
  ...(event ? { event } : {}),
});

/** Articles per pack the build keeps (the first ones that pass). */
export const TARGET = 30;
/** Packs that keep more, so every tour stop has a page (20-tours). */
export const TARGETS: Readonly<Record<string, number>> = { earth: 34, ancient: 32 };

export const SUBJECT_TOPICS: Readonly<Record<SubjectPackId, readonly SubjectTopic[]>> = {
  wildlife: [
    t('Elephant', 'African elephant'), t('Lion', 'lion male savanna'), t('Tiger', 'Bengal tiger'),
    t('Giraffe', 'giraffe savanna'), t('Blue whale', 'blue whale'), t('Gorilla', 'mountain gorilla'),
    t('Chimpanzee', 'chimpanzee'), t('Giant panda', 'giant panda eating bamboo'), t('Polar bear', 'polar bear ice'),
    t('Penguin', 'penguins colony'), t('Eagle', 'bald eagle'), t('Owl', 'barn owl'),
    t('Shark', 'shark swimming'), t('Dolphin', 'bottlenose dolphin'), t('Octopus', 'octopus coral'),
    t('Honey bee', 'honey bee flower'), t('Butterfly', 'monarch butterfly'), t('Crocodile', 'Nile crocodile'),
    t('Komodo dragon', 'Komodo dragon'), t('Cheetah', 'cheetah running'), t('Zebra', 'plains zebra'),
    t('Kangaroo', 'red kangaroo'), t('Koala', 'koala eucalyptus'), t('Platypus', 'platypus'),
    t('Wolf', 'grey wolf'), t('Hippopotamus', 'hippopotamus water'), t('Rhinoceros', 'white rhinoceros'),
    t('Camel', 'dromedary camel desert'), t('Bat', 'fruit bat flying'), t('Frog', 'tree frog'),
    t('Sea turtle', 'green sea turtle'), t('Hummingbird', 'hummingbird flower'), t('Flamingo', 'flamingos lake'),
    t('Ostrich', 'ostrich'), t('Orangutan', 'orangutan'), t('Meerkat', 'meerkat'),
    t('Leopard', 'leopard tree'), t('Lemur', 'ring-tailed lemur'), t('Moose', 'moose'), t('Coral reef', 'coral reef fish'),
  ],
  space: [
    t('Sun', 'Sun solar flare'), t('Moon', 'full moon'), t('Mercury (planet)', 'Mercury planet MESSENGER'),
    t('Venus', 'Venus planet'), t('Mars', 'Mars planet'), t('Jupiter', 'Jupiter planet'),
    t('Saturn', 'Saturn rings Cassini'), t('Uranus', 'Uranus planet'), t('Neptune', 'Neptune planet Voyager'),
    t('Pluto', 'Pluto New Horizons'), t('Solar System', 'Solar System planets'), t('Milky Way', 'Milky Way night sky'),
    t('Galaxy', 'spiral galaxy'), t('Star', 'stars night sky'), t('Black hole', 'black hole'),
    t('Comet', 'comet tail'), t('Asteroid', 'asteroid'), t('Solar eclipse', 'total solar eclipse'),
    t('Telescope', 'telescope observatory'), t('Hubble Space Telescope', 'Hubble Space Telescope orbit', 'launched'),
    t('International Space Station', 'International Space Station'), t('Apollo 11', 'Apollo 11 Buzz Aldrin', 'launched'),
    t('Sputnik 1', 'Sputnik replica', 'launched'), t('Yuri Gagarin', 'Yuri Gagarin', 'born'),
    t('Neil Armstrong', 'Neil Armstrong', 'born'), t('Space Shuttle', 'Space Shuttle launch'),
    t('Voyager 1', 'Voyager spacecraft', 'launched'), t('Big Bang', 'cosmic microwave background'),
    t('Supernova', 'supernova remnant'), t('Nebula', 'Orion Nebula'), t('Constellation', 'Orion constellation'),
    t('Astronaut', 'astronaut spacewalk'), t('Rocket', 'rocket launch'), t('Satellite', 'satellite orbit'),
    t('Aurora', 'aurora borealis'), t('Meteor', 'meteor shower'), t('Mars rover', 'Curiosity rover'),
    t('James Webb Space Telescope', 'James Webb Space Telescope', 'launched'), t('Valentina Tereshkova', 'Valentina Tereshkova', 'born'),
    t('Earth', 'Earth from space Blue Marble'),
  ],
  ancient: [
    t('Ancient Egypt', 'Egypt temple Karnak'), t('Great Pyramid of Giza', 'Great Pyramid of Giza'), t('Sphinx', 'Great Sphinx Giza'),
    t('Ancient Greece', 'Acropolis Athens'), t('Roman Empire', 'Roman ruins forum'), t('Julius Caesar', 'Julius Caesar statue'),
    t('Alexander the Great', 'Alexander the Great statue'), t('Cleopatra', 'Cleopatra Egypt'), t('Tutankhamun', 'Tutankhamun mask'),
    t('Great Wall of China', 'Great Wall of China Badaling'), t('Mesopotamia', 'ziggurat Ur'), t('Colosseum', 'Colosseum Rome'),
    t('Parthenon', 'Parthenon Athens'), t('Stonehenge', 'Stonehenge'), t('Maya civilization', 'Chichen Itza'),
    t('Aztec', 'Aztec Templo Mayor'), t('Inca Empire', 'Machu Picchu'), t('Machu Picchu', 'Machu Picchu'),
    t('Vikings', 'Viking ship'), t('Middle Ages', 'medieval castle'), t('Renaissance', 'Florence Duomo'),
    t('Industrial Revolution', 'Ironbridge Gorge'), t('Silk Road', 'Silk Road caravan'), t('Mali Empire', 'Great Mosque of Djenné'),
    t('Kingdom of Aksum', 'Aksum obelisk'), t('Great Zimbabwe', 'Great Zimbabwe ruins'), t('Terracotta Army', "Terracotta Army Xi'an"),
    t('Petra', 'Petra Treasury Jordan'), t('Angkor Wat', 'Angkor Wat'), t('Pompeii', 'Pompeii ruins'),
    t('Rosetta Stone', 'Rosetta Stone British Museum'), t('Colossus of Rhodes', 'Colossus of Rhodes'),
    t('Lighthouse of Alexandria', 'Pharos of Alexandria'), t('Hanging Gardens of Babylon', 'Babylon ruins Iraq'),
    t('Temple of Artemis', 'Temple of Artemis Ephesus'), t('Statue of Zeus at Olympia', 'Olympia ruins Greece'),
    t('Mausoleum at Halicarnassus', 'Mausoleum Halicarnassus Bodrum'), t('Seven Wonders of the Ancient World', 'Seven Wonders ancient'),
    t('Ancient Olympic Games', 'Olympia stadium ancient'), t('Samurai', 'samurai armour'), t('Byzantine Empire', 'Hagia Sophia'),
    t('Ottoman Empire', 'Topkapi Palace'), t('Ancient China', 'Forbidden City'),
  ],
  earth: [
    t('Mount Everest', 'Mount Everest'), t('Mount Kilimanjaro', 'Kilimanjaro'), t('Alps', 'Alps mountains'),
    t('Andes', 'Andes mountains'), t('Himalayas', 'Himalayas'), t('Rocky Mountains', 'Rocky Mountains'),
    t('Volcano', 'volcano eruption lava'), t('Mount Fuji', 'Mount Fuji'), t('Krakatoa', 'Anak Krakatau'),
    t('Mount Vesuvius', 'Mount Vesuvius'), t('Mount St. Helens', 'Mount St. Helens'), t('Mount Pinatubo', 'Mount Pinatubo'),
    t('Cotopaxi', 'Cotopaxi volcano'), t('Popocatépetl', 'Popocatépetl volcano'), t('Mount Etna', 'Mount Etna'),
    t('Mount Rainier', 'Mount Rainier'), t('Mount Hood', 'Mount Hood'), t('Mount Shasta', 'Mount Shasta'),
    t('Mount Baker', 'Mount Baker'), t('Mount Merapi', 'Mount Merapi'), t('Sakurajima', 'Sakurajima'),
    t('Mount Tambora', 'Mount Tambora'), t('Mount Erebus', 'Mount Erebus'), t('Mount Taranaki', 'Mount Taranaki'),
    t('Mount Ruapehu', 'Mount Ruapehu'), t('Mount Aso', 'Mount Aso'), t('Mayon Volcano', 'Mayon Volcano'),
    t('Mauna Loa', 'Mauna Loa'),
    t('Plate tectonics', 'tectonic plates rift'), t('Ring of Fire', 'Pacific Ring of Fire volcano'),
    t('Nile', 'Nile river Aswan'), t('Amazon River', 'Amazon River'), t('Yangtze River', 'Yangtze River'),
    t('Mississippi River', 'Mississippi River'), t('Danube', 'Danube river Budapest'), t('Congo River', 'Congo River'),
    t('Ganges', 'Ganges Varanasi'), t('Murray River', 'Murray River'), t('Niger River', 'Niger River'),
    t('Rhine', 'Rhine river'), t('Mekong', 'Mekong River'), t('Pacific Ocean', 'Pacific Ocean coast'),
    t('Atlantic Ocean', 'Atlantic Ocean coast'), t('Indian Ocean', 'Indian Ocean beach'), t('Arctic Ocean', 'Arctic Ocean ice'),
    t('Southern Ocean', 'Southern Ocean iceberg'), t('Great Barrier Reef', 'Great Barrier Reef'), t('Sahara', 'Sahara dunes'),
    t('Amazon rainforest', 'Amazon rainforest'), t('Grand Canyon', 'Grand Canyon'), t('Niagara Falls', 'Niagara Falls'),
    t('Lake Baikal', 'Lake Baikal'), t('Antarctica', 'Antarctica ice'), t('Glacier', 'glacier'),
  ],
  body: [
    t('Heart', 'human heart anatomy'), t('Brain', 'human brain'), t('Lung', 'lungs anatomy'),
    t('Human skeleton', 'human skeleton'), t('Muscle', 'muscle anatomy'), t('Skin', 'human skin'),
    t('Eye', 'human eye'), t('Ear', 'human ear anatomy'), t('Nose', 'human nose'),
    t('Tongue', 'human tongue'), t('Stomach', 'stomach anatomy'), t('Liver', 'liver anatomy'),
    t('Kidney', 'kidney anatomy'), t('Blood', 'blood cells'), t('Bone', 'bone structure'),
    t('Tooth', 'human teeth'), t('Digestion', 'digestive system'), t('Nervous system', 'nervous system'),
    t('Immune system', 'white blood cell'), t('Cell', 'cell microscope'), t('DNA', 'DNA double helix'),
    t('Sleep', 'child sleeping'), t('Hair', 'human hair'), t('Vaccine', 'vaccination'),
    t('Spinal cord', 'spinal cord anatomy'), t('Hand', 'human hand'), t('Skull', 'human skull'),
    t('Pancreas', 'pancreas anatomy'), t('Intestine', 'intestine anatomy'), t('Blood vessel', 'blood vessels'),
    t('Hormone', 'hormone'), t('Breathing', 'breathing lungs'), t('Taste', 'taste buds'),
    t('Joint', 'knee joint'), t('Pulse', 'pulse measuring'), t('Fingerprint', 'fingerprint'),
    t('Human body', 'human body'), t('Tissue', 'tissue'), t('Artery', 'artery'), t('Vein', 'vein'), t('Esophagus', 'esophagus'), t('Throat', 'throat'), t('Bladder', 'bladder'), t('Diaphragm (anatomy)', 'diaphragm (anatomy)'), t('Rib', 'rib'), t('Vertebral column', 'vertebral column'), t('Thumb', 'thumb'), t('Finger', 'finger'), t('Arm', 'arm'), t('Knee', 'knee'), t('Elbow', 'elbow'), t('Neck', 'neck'), t('Face', 'face'), t('Mouth', 'mouth'), t('Cerebellum', 'cerebellum'), t('Blood pressure', 'blood pressure'), t('Protein', 'protein'), t('Vitamin', 'vitamin'), t('Calorie', 'calorie'), t('Exercise', 'exercise'), t('Hygiene', 'hygiene'), t('Allergy', 'allergy'), t('Fever', 'fever'), t('Tonsil', 'tonsil'), t('Appendix', 'appendix'), t('Gland', 'gland'), t('Saliva', 'saliva'), t('Sweat', 'sweat'), t('Reflex', 'reflex'),
  ],
  science: [
    t('Atom', 'atom model'), t('Molecule', 'molecule model'), t('Chemical element', 'periodic table'),
    t('Periodic table', 'periodic table'), t('Hydrogen', 'hydrogen balloon'), t('Oxygen', 'oxygen'),
    t('Carbon', 'diamond graphite carbon'), t('Water', 'water drop'), t('Gold', 'gold nugget'),
    t('Iron', 'iron ore'), t('Salt', 'sea salt'), t('Acid', 'lemon acid'),
    t('Gravity', 'apple falling gravity'), t('Force', 'force pushing'), t('Energy', 'wind turbine energy'),
    t('Light', 'prism light rainbow'), t('Sound', 'sound waves'), t('Magnet', 'magnet iron filings'),
    t('Heat', 'heat flame'), t('Speed of light', 'light beam'), t('Friction', 'friction sparks'),
    t('Mass', 'balance scale mass'), t('Matter', 'states of matter'), t('Chemical reaction', 'chemical reaction'),
    t('Gas', 'gas flame'), t('Liquid', 'liquid pouring'), t('Solid', 'ice solid'),
    t('Nuclear power', 'nuclear power plant'), t('Radioactivity', 'radioactivity'), t('Pressure', 'pressure gauge'),
    t('Temperature', 'thermometer'), t('Combustion', 'fire burning'), t('Laser', 'laser'),
    t('Rainbow', 'rainbow'), t('Echo', 'echo mountains'), t('Lens', 'lens'), t('Metal', 'metal'),
    t('Sodium', 'sodium'), t('Helium', 'helium balloons'), t('Mirror', 'mirror reflection'),
    t('Electron', 'electron'), t('Proton', 'proton'), t('Neutron', 'neutron'), t('Atomic nucleus', 'atomic nucleus'), t('Wave', 'wave'), t('Orbit', 'orbit'), t('Density', 'density'), t('Volume', 'volume'), t('Speed', 'speed'), t('Velocity', 'velocity'), t('Acceleration', 'acceleration'), t('Joule', 'joule'), t('Watt', 'watt'), t('X-ray', 'x-ray'), t('Infrared', 'infrared'), t('Ultraviolet', 'ultraviolet'), t('Microwave', 'microwave'), t('Chemical bond', 'chemical bond'), t('Ion', 'ion'), t('Isotope', 'isotope'), t('Mixture', 'mixture'), t('Crystal', 'crystal'), t('Diamond', 'diamond'), t('Graphite', 'graphite'), t('Steel', 'steel'), t('Copper', 'copper'), t('Aluminium', 'aluminium'), t('Silver', 'silver'), t('Chlorine', 'chlorine'), t('Nitrogen', 'nitrogen'), t('Neon', 'neon'), t('Calcium', 'calcium'), t('Potassium', 'potassium'),
  ],
  inventions: [
    t('Wheel', 'wheel'), t('Printing press', 'printing press'), t('Telephone', 'telephone'),
    t('Incandescent light bulb', 'light bulb'), t('Steam engine', 'steam engine'), t('Airplane', 'airplane'),
    t('Car', 'car'), t('Bicycle', 'bicycle'), t('Train', 'train'),
    t('Computer', 'computer'), t('Internet', 'internet cables'), t('World Wide Web', 'web server'),
    t('Radio', 'radio'), t('Television', 'television'), t('Camera', 'camera'),
    t('Microscope', 'microscope'), t('Compass', 'compass'), t('Paper', 'paper'),
    t('Clock', 'clock'), t('Robot', 'robot'), t('Mobile phone', 'mobile phone'),
    t('Refrigerator', 'refrigerator'), t('Steamboat', 'steamboat'), t('Submarine', 'submarine'),
    t('Helicopter', 'helicopter'), t('Elevator', 'elevator'), t('Plastic', 'plastic'),
    t('Solar power', 'solar panels'), t('Wind turbine', 'wind turbine'), t('Penicillin', 'penicillin'),
    t('Printer', '3D printer'), t('Bridge', 'bridge'), t('Dam', 'dam'), t('Sewing machine', 'sewing machine'),
    t('Typewriter', 'typewriter'), t('Washing machine', 'washing machine'), t('Calculator', 'calculator'),
    t('Zipper', 'zipper'), t('Parachute', 'parachute'), t('Lighthouse', 'lighthouse'),
    t('Printing', 'printing'), t('Alphabet', 'alphabet'), t('Writing', 'writing'), t('Glass', 'glass'), t('Magnifying glass', 'magnifying glass'), t('Umbrella', 'umbrella'), t('Thermometer', 'thermometer'), t('Barometer', 'barometer'), t('Stethoscope', 'stethoscope'), t('Cash register', 'cash register'), t('Barcode', 'barcode'), t('Electric guitar', 'electric guitar'), t('Skateboard', 'skateboard'), t('Roller coaster', 'roller coaster'), t('Escalator', 'escalator'), t('Airship', 'airship'), t('Hot air balloon', 'hot air balloon'), t('Hovercraft', 'hovercraft'), t('Motorcycle', 'motorcycle'), t('Tractor', 'tractor'), t('Plough', 'plough'), t('Windmill', 'windmill'), t('Water wheel', 'water wheel'), t('Aqueduct', 'aqueduct'), t('Gunpowder', 'gunpowder'), t('Compass (navigation)', 'compass (navigation)'),
  ],
  people: [
    t('Albert Einstein', 'Albert Einstein', 'born'), t('Marie Curie', 'Marie Curie', 'born'), t('Isaac Newton', 'Isaac Newton statue'),
    t('Mahatma Gandhi', 'Mahatma Gandhi', 'born'), t('Martin Luther King Jr.', 'Martin Luther King', 'born'), t('Nelson Mandela', 'Nelson Mandela', 'born'),
    t('Wangari Maathai', 'Wangari Maathai', 'born'), t('Rosa Parks', 'Rosa Parks', 'born'), t('Malala Yousafzai', 'Malala Yousafzai', 'born'),
    t('Amelia Earhart', 'Amelia Earhart', 'born'), t('Thomas Edison', 'Thomas Edison', 'born'), t('Nikola Tesla', 'Nikola Tesla', 'born'),
    t('Jane Goodall', 'Jane Goodall', 'born'), t('Stephen Hawking', 'Stephen Hawking', 'born'), t('Charles Darwin', 'Charles Darwin statue'),
    t('Florence Nightingale', 'Florence Nightingale statue', 'born'), t('Alan Turing', 'Alan Turing statue', 'born'), t('Ada Lovelace', 'Ada Lovelace'),
    t('Tim Berners-Lee', 'Tim Berners-Lee', 'born'), t('Barack Obama', 'Barack Obama', 'born'), t('Winston Churchill', 'Winston Churchill'),
    t('Mother Teresa', 'Mother Teresa', 'born'), t('Helen Keller', 'Helen Keller', 'born'), t('Kwame Nkrumah', 'Kwame Nkrumah', 'born'),
    t('Desmond Tutu', 'Desmond Tutu', 'born'), t('Kofi Annan', 'Kofi Annan', 'born'), t('Chinua Achebe', 'Chinua Achebe', 'born'),
    t('Wole Soyinka', 'Wole Soyinka', 'born'), t('Haile Selassie I', 'Haile Selassie', 'born'), t('Julius Nyerere', 'Julius Nyerere', 'born'),
    t('Jomo Kenyatta', 'Jomo Kenyatta', 'born'), t('Ellen Johnson Sirleaf', 'Ellen Johnson Sirleaf', 'born'), t('Wright brothers', 'Wright Flyer'),
    t('Christopher Columbus', 'Columbus monument'), t('Marco Polo', 'Marco Polo statue'), t('Ibn Battuta', 'Ibn Battuta Mall'),
    t('Mansa Musa', 'Mansa Musa'), t('Steve Jobs', 'Steve Jobs', 'born'), t('Katherine Johnson', 'Katherine Johnson', 'born'),
    t('Mae Jemison', 'Mae Jemison', 'born'), t('Sally Ride', 'Sally Ride', 'born'), t('Miriam Makeba', 'Miriam Makeba', 'born'),
    t('William Shakespeare', 'william shakespeare'), t('Elizabeth II', 'elizabeth ii'), t('Bill Gates', 'bill gates'), t('Elon Musk', 'elon musk'), t('Oprah Winfrey', 'oprah winfrey'), t('Michelle Obama', 'michelle obama'), t('Jane Austen', 'jane austen'), t('Mahatma Gandhi', 'mahatma gandhi'), t('Harriet Tubman', 'harriet tubman'), t('Frederick Douglass', 'frederick douglass'), t('Abraham Lincoln', 'abraham lincoln'), t('George Washington', 'george washington'), t('Queen Victoria', 'queen victoria'), t('Che Guevara', 'che guevara'), t('Leonardo da Vinci', 'leonardo da vinci'), t('Galileo Galilei', 'galileo galilei'), t('Cleopatra VII', 'cleopatra vii'),
  ],
  arts: [
    t('Piano', 'grand piano'), t('Guitar', 'acoustic guitar'), t('Drum', 'drum kit'),
    t('Violin', 'violin'), t('Orchestra', 'symphony orchestra'), t('Opera', 'opera house stage'),
    t('Ballet', 'ballet dancers'), t('Sculpture', 'sculpture'), t('Photography', 'photographer camera'),
    t('Cinema', 'cinema'), t('Theatre', 'theatre stage'), t('Football', 'football match'),
    t('Basketball', 'basketball'), t('Tennis', 'tennis'), t('Cricket', 'cricket match'),
    t('Athletics', 'athletics track'), t('Swimming', 'swimming pool'), t('Olympic Games', 'Olympic Games stadium'),
    t('FIFA World Cup', 'World Cup stadium'), t('Chess', 'chess board'), t('Jazz', 'jazz band'),
    t('Hip hop music', 'hip hop dancer'), t('Reggae', 'reggae Jamaica'), t('Afrobeat', 'Afrobeat'),
    t('Dance', 'dancers'), t('Poetry', 'poetry reading'), t('Literature', 'library books'),
    t('Museum', 'museum'), t('Mozart', 'Mozart statue', 'born'), t('Ludwig van Beethoven', 'Beethoven monument', 'born'),
    t('Usain Bolt', 'Usain Bolt', 'born'), t('Jesse Owens', 'Jesse Owens', 'born'), t('Muhammad Ali', 'Muhammad Ali', 'born'),
    t('Pelé', 'Pelé', 'born'), t('Serena Williams', 'Serena Williams', 'born'), t('Lionel Messi', 'Lionel Messi', 'born'),
    t('Bob Marley', 'Bob Marley', 'born'), t('Fela Kuti', 'Fela Kuti', 'born'), t('Louis Armstrong', 'Louis Armstrong', 'born'),
    t('Painting', 'painting artist canvas'), t('Mask', 'African mask'),
    t('Saxophone', 'saxophone'), t('Trumpet', 'trumpet'), t('Flute', 'flute'), t('Choir', 'choir'), t('Drawing', 'drawing'), t('Film', 'film'), t('Animation', 'animation'), t('Cartoon', 'cartoon'), t('Comics', 'comics'), t('Folk music', 'folk music'), t('Pop music', 'pop music'), t('Rock music', 'rock music'), t('Gymnastics', 'gymnastics'), t('Boxing', 'boxing'), t('Rugby', 'rugby'), t('Golf', 'golf'), t('Volleyball', 'volleyball'), t('Table tennis', 'table tennis'), t('Marathon', 'marathon'), t('Skiing', 'skiing'), t('Surfing', 'surfing'), t('Cycling', 'cycling'), t('Baseball', 'baseball'), t('Judo', 'judo'), t('Karate', 'karate'),
  ],
};
