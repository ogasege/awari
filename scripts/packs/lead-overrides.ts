/**
 * Lead photographs chosen by eye from a contact sheet of the judges' path
 * and the thirty most populous countries (21-review-2 Req 20,
 * `scripts/review-leads.ts`). Each replaced a lead that did not show a
 * place a ten-year-old would recognise (a drone shot of dirt tracks for
 * Nigeria, a swamp for Russia, a set of drums for Bangladesh). They go
 * through the same Commons licence, author and suitability checks as any
 * override, in `npm run packs` and in `scripts/packs/apply-lead-overrides.ts`.
 */
import type { PhotoOverride } from './photos.ts';

export const LEAD_OVERRIDES: ReadonlyArray<readonly [string, PhotoOverride]> = [
  ['countries/nigeria', { file: 'Lagos skyline with marina.jpg', caption: 'The Lagos skyline', alt: 'The tall buildings of Lagos beside the water, with boats in the marina' }],
  ['countries/india', { file: 'Taj Mahal in March 2004.jpg', caption: 'The Taj Mahal', alt: 'The white marble Taj Mahal with its dome and four tall towers' }],
  ['countries/peoples-republic-of-china', { file: 'Great Wall of China July 2006.JPG', caption: 'The Great Wall', alt: 'The Great Wall of China winding along a hill ridge' }],
  ['countries/indonesia', { file: 'Borobudur-Nothwest-view.jpg', caption: 'Borobudur temple', alt: 'The stone temple of Borobudur on Java, with its stepped levels and stupas' }],
  ['countries/pakistan', { file: 'Badshahi Mosque (Lahore).jpg', caption: 'Badshahi Mosque', alt: 'The Badshahi Mosque in Lahore with its red walls and white domes' }],
  ['countries/brazil', { file: 'Redentor Over Clouds 1.jpg', caption: 'Christ the Redeemer', alt: 'The statue of Christ the Redeemer above the clouds in Rio de Janeiro' }],
  ['countries/bangladesh', { file: 'Ahsan Manzil-Front View.jpg', caption: 'Ahsan Manzil', alt: 'The pink palace of Ahsan Manzil in Dhaka, seen from the front' }],
  ['countries/russia', { file: 'Sant Vasily cathedral in Moscow.JPG', caption: 'Saint Basil’s Cathedral', alt: 'Saint Basil’s Cathedral in Moscow with its bright, twisting domes' }],
  ['countries/mexico', { file: 'Chichen Itza 3.jpg', caption: 'Chichén Itzá', alt: 'The stepped pyramid El Castillo at Chichén Itzá' }],
  ['countries/ethiopia', { file: 'Bete Giyorgis 03.jpg', caption: 'Church of Saint George', alt: 'The Church of Saint George at Lalibela, a church carved down into the rock in the shape of a cross' }],
  ['countries/egypt', { file: 'All Gizah Pyramids.jpg', caption: 'The pyramids of Giza', alt: 'The three great pyramids of Giza standing in the desert' }],
  ['countries/vietnam', { file: 'Halong Bay in Vietnam.jpg', caption: 'Ha Long Bay', alt: 'Tall rocky islands rising out of the sea in Ha Long Bay' }],
  ['countries/iran', { file: 'Persepolis 24.11.2009 11-18-45.jpg', caption: 'Persepolis stone griffin', alt: 'A carved stone griffin on top of a column in the ancient city of Persepolis' }],
  ['countries/philippines', { file: 'Chocolate Hills Carmen Bohol 2019.jpg', caption: 'The Chocolate Hills', alt: 'Rows of round, grass-covered hills called the Chocolate Hills on Bohol island' }],
  ['countries/france', { file: 'Tour Eiffel Wikimedia Commons.jpg', caption: 'The Eiffel Tower', alt: 'The Eiffel Tower in Paris' }],
  ['countries/united-states', { file: 'Statue of Liberty frontal 2.jpg', caption: 'Statue of Liberty', alt: 'The Statue of Liberty holding up her torch, seen from the front' }],
  ['countries/united-kingdom', { file: 'Tower Bridge London Feb 2006.jpg', caption: 'Tower Bridge', alt: 'Tower Bridge over the River Thames in London' }],
  ['countries/italy', { file: 'Rome Colosseum exterior 1.jpg', caption: 'The Colosseum', alt: 'The outside wall of the Colosseum in Rome, with its rows of arches' }],
  ['countries/spain', { file: 'Exterior of the Sagrada Família 20171225.jpg', caption: 'Sagrada Família', alt: 'The outside of the Sagrada Família church in Barcelona, with its tall carved towers' }],
  ['countries/colombia', { file: 'Cartagena Old City.JPG', caption: 'Old Cartagena', alt: 'A street of brightly painted houses in the old city of Cartagena' }],
  ['countries/south-africa', { file: 'Table Mountain from Blouberg, South Africa (4028515275).jpg', caption: 'Table Mountain', alt: 'Table Mountain, the flat-topped mountain above Cape Town, seen across the bay' }],
  ['countries/tanzania', { file: 'Kilimanjaro, Tanzania, 2024-05-22, DD 15.jpg', caption: 'Mount Kilimanjaro', alt: 'Snow-capped Mount Kilimanjaro rising above the clouds' }],
  ['countries/kenya', { file: 'Amboseli Park - Kilimanjaro elephant.jpg', caption: 'Elephant in Amboseli', alt: 'An elephant in Amboseli National Park in Kenya with Mount Kilimanjaro behind it' }],
  ['countries/myanmar', { file: '20160813 Shwedagon Pagoda 9949 DxO.jpg', caption: 'Shwedagon Pagoda', alt: 'The golden Shwedagon Pagoda in Yangon' }],
  ['countries/south-korea', { file: 'Gyeonghoeru (Royal Banquet Hall) at Gyeongbokgung Palace, Seoul.jpg', caption: 'Gyeongbokgung Palace', alt: 'The Gyeonghoeru banquet hall beside a pond at Gyeongbokgung Palace in Seoul' }],
  // One animal per picture for the wildlife prints (22-review-3 Req 21): these two leads were four-photo collages.
  ['wildlife/bat', { file: 'Grey headed flying fox - AndrewMercer IMG41833.jpg', caption: 'Grey-headed flying fox', alt: 'A grey-headed flying fox, a large bat' }],
  ['wildlife/hummingbird', { file: "Anna's hummingbird (Calypte anna) male in flight Campbell River.jpg", caption: 'A hovering hummingbird', alt: 'A hummingbird hovering in the air' }],
];
