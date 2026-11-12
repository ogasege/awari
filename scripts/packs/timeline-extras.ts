/**
 * Curated extra timeline items (18-world-timeline), resolved from names
 * to Wikidata ids by a helper and reviewed by hand: every row had a
 * single day-precision date on Wikidata. Items that are weapons,
 * wars, disasters or otherwise unsuitable for ages 9 to 14 were left out.
 * Dates come from Wikidata at build time; nothing here is a date.
 */
import type { TimelineItem } from './timeline.ts';

export const EXTRA_ITEMS: readonly TimelineItem[] = [
  { qid: 'Q160627', subject: 'wildlife', kind: 'born' }, // Alfred Russel Wallace
  { qid: 'Q1043', subject: 'wildlife', kind: 'born' }, // Carl Linnaeus
  { qid: 'Q100948', subject: 'wildlife', kind: 'born' }, // Rachel Carson
  { qid: 'Q183337', subject: 'wildlife', kind: 'born' }, // David Attenborough
  { qid: 'Q234224', subject: 'wildlife', kind: 'born' }, // Dian Fossey
  { qid: 'Q126513', subject: 'wildlife', kind: 'born' }, // Steve Irwin
  { qid: 'Q310400', subject: 'wildlife', kind: 'born' }, // Gerald Durrell
  { qid: 'Q83233', subject: 'wildlife', kind: 'born' }, // Jacques Cousteau
  { qid: 'Q379580', subject: 'wildlife', kind: 'born' }, // John Muir
  { qid: 'Q14837', subject: 'wildlife', kind: 'born' }, // Louis Leakey
  { qid: 'Q231111', subject: 'wildlife', kind: 'born' }, // Mary Leakey
  { qid: 'Q214565', subject: 'wildlife', kind: 'born' }, // Beatrix Potter
  { qid: 'Q439046', subject: 'wildlife', kind: 'born' }, // Sylvia Earle
  { qid: 'Q78496', subject: 'wildlife', kind: 'born' }, // Konrad Lorenz
  { qid: 'Q6694', subject: 'wildlife', kind: 'born' }, // Alexander von Humboldt
  { qid: 'Q93645', subject: 'wildlife', kind: 'born' }, // Joy Adamson
  { qid: 'Q82122', subject: 'wildlife', kind: 'born' }, // Jean-Baptiste Lamarck
  { qid: 'Q171969', subject: 'wildlife', kind: 'born' }, // Georges Cuvier
  { qid: 'Q318960', subject: 'wildlife', kind: 'born' }, // Richard Leakey
  { qid: 'Q33866', subject: 'wildlife', kind: 'born' }, // Theodore Roosevelt
  { qid: 'Q41858', subject: 'wildlife', kind: 'established' }, // Banff National Park
  { qid: 'Q180402', subject: 'wildlife', kind: 'established' }, // Yosemite National Park
  { qid: 'Q270263', subject: 'wildlife', kind: 'established' }, // London Zoo
  { qid: 'Q117892', subject: 'wildlife', kind: 'established' }, // World Wide Fund for Nature
  { qid: 'Q944329', subject: 'earth', kind: 'established' }, // Mount Rainier National Park
  { qid: 'Q33817', subject: 'earth', kind: 'born' }, // Edmund Hillary
  { qid: 'Q80732', subject: 'earth', kind: 'born' }, // Tenzing Norgay
  { qid: 'Q926', subject: 'earth', kind: 'born' }, // Roald Amundsen
  { qid: 'Q957543', subject: 'earth', kind: 'born' }, // Ernest Shackleton
  { qid: 'Q102527', subject: 'earth', kind: 'born' }, // Robert Falcon Scott
  { qid: 'Q7324', subject: 'earth', kind: 'born' }, // James Cook
  { qid: 'Q48373', subject: 'earth', kind: 'born' }, // David Livingstone
  { qid: 'Q5333', subject: 'earth', kind: 'born' }, // Charles Lyell
  { qid: 'Q76323', subject: 'earth', kind: 'born' }, // Alfred Wegener
  { qid: 'Q7331', subject: 'earth', kind: 'born' }, // Ibn Battuta
  { qid: 'Q976683', subject: 'earth', kind: 'born' }, // Matthew Henson
  { qid: 'Q234491', subject: 'earth', kind: 'born' }, // Junko Tabei
  { qid: 'Q538786', subject: 'earth', kind: 'born' }, // Marie Tharp
  { qid: 'Q182814', subject: 'earth', kind: 'founded', continent: 'Antarctica' }, // Antarctic Treaty System
  { qid: 'Q324', subject: 'space', kind: 'discovered' }, // Uranus
  { qid: 'Q332', subject: 'space', kind: 'discovered' }, // Neptune
  { qid: 'Q339', subject: 'space', kind: 'discovered' }, // Pluto
  { qid: 'Q36620', subject: 'space', kind: 'born' }, // Tycho Brahe
  { qid: 'Q39599', subject: 'space', kind: 'born' }, // Christiaan Huygens
  { qid: 'Q14277', subject: 'space', kind: 'born' }, // William Herschel
  { qid: 'Q76948', subject: 'space', kind: 'born' }, // Caroline Herschel
  { qid: 'Q230650', subject: 'space', kind: 'born' }, // Annie Jump Cannon
  { qid: 'Q110181', subject: 'space', kind: 'born' }, // Henrietta Swan Leavitt
  { qid: 'Q234909', subject: 'space', kind: 'born' }, // Cecilia Payne-Gaposchkin
  { qid: 'Q234888', subject: 'space', kind: 'born' }, // Vera Rubin
  { qid: 'Q233974', subject: 'space', kind: 'born' }, // Jocelyn Bell Burnell
  { qid: 'Q174979', subject: 'space', kind: 'born' }, // Alan Shepard
  { qid: 'Q182642', subject: 'space', kind: 'born' }, // John Glenn
  { qid: 'Q152318', subject: 'space', kind: 'born' }, // Svetlana Savitskaya
  { qid: 'Q1076962', subject: 'space', kind: 'born' }, // Chris Hadfield
  { qid: 'Q147581', subject: 'space', kind: 'born' }, // Yang Liwei
  { qid: 'Q325205', subject: 'space', kind: 'born' }, // Rakesh Sharma
  { qid: 'Q237879', subject: 'space', kind: 'born' }, // Kalpana Chawla
  { qid: 'Q47434', subject: 'space', kind: 'born' }, // Edmond Halley
  { qid: 'Q34091', subject: 'space', kind: 'born' }, // Mae Jemison
  { qid: 'Q41239', subject: 'space', kind: 'born' }, // Konstantin Tsiolkovsky
  { qid: 'Q182546', subject: 'space', kind: 'born' }, // Robert Goddard
  { qid: 'Q184201', subject: 'space', kind: 'launched' }, // Apollo 8
  { qid: 'Q48461', subject: 'space', kind: 'launched' }, // New Horizons
  { qid: 'Q899091', subject: 'space', kind: 'launched' }, // Parker Solar Probe
  { qid: 'Q203805', subject: 'space', kind: 'launched' }, // Mariner 4
  { qid: 'Q152800', subject: 'space', kind: 'launched' }, // Venera 7
  { qid: 'Q48604', subject: 'space', kind: 'launched' }, // Mir
  { qid: 'Q65049774', subject: 'space', kind: 'launched' }, // Chandrayaan-3
  { qid: 'Q47272', subject: 'space', kind: 'launched' }, // Kepler space telescope
  { qid: 'Q201953', subject: 'space', kind: 'launched' }, // Spitzer Space Telescope
  { qid: 'Q49002', subject: 'space', kind: 'launched' }, // Chandra X-ray Observatory
  { qid: 'Q2113134', subject: 'space', kind: 'launched' }, // Hayabusa2
  { qid: 'Q41257', subject: 'physics', kind: 'born' }, // Heinrich Hertz
  { qid: 'Q36488', subject: 'physics', kind: 'born' }, // Guglielmo Marconi
  { qid: 'Q75698', subject: 'physics', kind: 'born' }, // Samuel Morse
  { qid: 'Q315422', subject: 'physics', kind: 'born' }, // Joseph Swan
  { qid: 'Q44412', subject: 'physics', kind: 'born' }, // Hans Christian Ørsted
  { qid: 'Q1589', subject: 'physics', kind: 'born' }, // Luigi Galvani
  { qid: 'Q81716', subject: 'physics', kind: 'born' }, // Charles-Augustin de Coulomb
  { qid: 'Q8962', subject: 'physics', kind: 'born' }, // James Prescott Joule
  { qid: 'Q157043', subject: 'physics', kind: 'born' }, // Joseph Henry
  { qid: 'Q58577', subject: 'physics', kind: 'born' }, // Werner von Siemens
  { qid: 'Q60052', subject: 'physics', kind: 'born' }, // Gustav Kirchhoff
  { qid: 'Q9036', subject: 'physics', kind: 'born' }, // Nikola Tesla
  { qid: 'Q34286', subject: 'physics', kind: 'born' }, // Alexander Graham Bell
  { qid: 'Q7085', subject: 'science', kind: 'born' }, // Niels Bohr
  { qid: 'Q9021', subject: 'science', kind: 'born' }, // Max Planck
  { qid: 'Q9130', subject: 'science', kind: 'born' }, // Erwin Schrödinger
  { qid: 'Q39246', subject: 'science', kind: 'born' }, // Richard Feynman
  { qid: 'Q9123', subject: 'science', kind: 'born' }, // Ernest Rutherford
  { qid: 'Q35149', subject: 'science', kind: 'born' }, // Wilhelm Röntgen
  { qid: 'Q56189', subject: 'science', kind: 'born' }, // Lise Meitner
  { qid: 'Q39607', subject: 'science', kind: 'born' }, // Antoine Lavoisier
  { qid: 'Q43393', subject: 'science', kind: 'born' }, // Robert Boyle
  { qid: 'Q41284', subject: 'science', kind: 'born' }, // John Dalton
  { qid: 'Q48983', subject: 'science', kind: 'born' }, // Linus Pauling
  { qid: 'Q7487', subject: 'science', kind: 'born' }, // Dorothy Hodgkin
  { qid: 'Q23810', subject: 'science', kind: 'born' }, // Alfred Nobel
  { qid: 'Q7099', subject: 'science', kind: 'born' }, // Emmy Noether
  { qid: 'Q450317', subject: 'science', kind: 'born' }, // Chien-Shiung Wu
  { qid: 'Q60429', subject: 'science', kind: 'born' }, // C. V. Raman
  { qid: 'Q45789', subject: 'science', kind: 'born' }, // Satyendra Nath Bose
  { qid: 'Q314267', subject: 'science', kind: 'born' }, // Jagadish Chandra Bose
  { qid: 'Q19045', subject: 'science', kind: 'born' }, // Mario Molina
  { qid: 'Q9106', subject: 'science', kind: 'born' }, // Dmitri Mendeleev
  { qid: 'Q81130', subject: 'science', kind: 'born' }, // Anders Celsius
  { qid: 'Q1290', subject: 'science', kind: 'born' }, // Blaise Pascal
  { qid: 'Q102490', subject: 'science', kind: 'born' }, // Evangelista Torricelli
  { qid: 'Q131721', subject: 'science', kind: 'born' }, // Johannes Diderik van der Waals
  { qid: 'Q28189', subject: 'science', kind: 'born' }, // Abdus Salam
  { qid: 'Q80956', subject: 'science', kind: 'born' }, // Svante Arrhenius
  { qid: 'Q7426', subject: 'science', kind: 'born' }, // Ada Yonath
  { qid: 'Q57100', subject: 'science', kind: 'born' }, // Maria Goeppert Mayer
  { qid: 'Q155768', subject: 'body', kind: 'born' }, // Joseph Lister
  { qid: 'Q234572', subject: 'body', kind: 'born' }, // Elizabeth Blackwell
  { qid: 'Q37193', subject: 'body', kind: 'born' }, // Robert Koch
  { qid: 'Q59736', subject: 'body', kind: 'born' }, // Ignaz Semmelweis
  { qid: 'Q188803', subject: 'body', kind: 'born' }, // Christiaan Barnard
  { qid: 'Q93128', subject: 'body', kind: 'born' }, // William Harvey
  { qid: 'Q170267', subject: 'body', kind: 'born' }, // Andreas Vesalius
  { qid: 'Q200101', subject: 'body', kind: 'born' }, // Jonas Salk
  { qid: 'Q37064', subject: 'body', kind: 'born' }, // Alexander Fleming
  { qid: 'Q180350', subject: 'body', kind: 'born' }, // Frederick Banting
  { qid: 'Q77128', subject: 'body', kind: 'born' }, // Ruth Pfau
  { qid: 'Q150526', subject: 'body', kind: 'born' }, // Santiago Ramón y Cajal
  { qid: 'Q164790', subject: 'body', kind: 'born' }, // Albert Sabin
  { qid: 'Q463891', subject: 'body', kind: 'born' }, // Virginia Apgar
  { qid: 'Q669426', subject: 'body', kind: 'born' }, // Patrick Steptoe
  { qid: 'Q188039', subject: 'body', kind: 'born' }, // Clara Barton
  { qid: 'Q4793563', subject: 'body', kind: 'born' }, // Rebecca Lee Crumpler
  { qid: 'Q35703', subject: 'body', kind: 'born' }, // Gertrude Elion
  { qid: 'Q49330', subject: 'body', kind: 'founded' }, // Médecins Sans Frontières
  { qid: 'Q1856835', subject: 'body', kind: 'founded' }, // Pan American Health Organization
  { qid: 'Q7817', subject: 'body', kind: 'founded' }, // World Health Organization
  { qid: 'Q40224', subject: 'inventions', kind: 'born' }, // Karl Benz
  { qid: 'Q12674', subject: 'inventions', kind: 'born' }, // Rudolf Diesel
  { qid: 'Q207380', subject: 'inventions', kind: 'born' }, // Isambard Kingdom Brunel
  { qid: 'Q133614', subject: 'inventions', kind: 'born' }, // George Stephenson
  { qid: 'Q192496', subject: 'inventions', kind: 'born' }, // Robert Fulton
  { qid: 'Q171413', subject: 'inventions', kind: 'born' }, // Elisha Otis
  { qid: 'Q131405', subject: 'inventions', kind: 'born' }, // Louis Daguerre
  { qid: 'Q189147', subject: 'inventions', kind: 'born' }, // George Eastman
  { qid: 'Q1316686', subject: 'inventions', kind: 'born' }, // Garrett Morgan
  { qid: 'Q447716', subject: 'inventions', kind: 'born' }, // Madam C. J. Walker
  { qid: 'Q19837', subject: 'inventions', kind: 'born' }, // Steve Jobs
  { qid: 'Q5284', subject: 'inventions', kind: 'born' }, // Bill Gates
  { qid: 'Q49034', subject: 'inventions', kind: 'born' }, // Hedy Lamarr
  { qid: 'Q46633', subject: 'inventions', kind: 'born' }, // Charles Babbage
  { qid: 'Q133544', subject: 'inventions', kind: 'born' }, // John Logie Baird
  { qid: 'Q360098', subject: 'inventions', kind: 'born' }, // Philo Farnsworth
  { qid: 'Q193042', subject: 'inventions', kind: 'born' }, // Thomas Newcomen
  { qid: 'Q217157', subject: 'inventions', kind: 'born' }, // Richard Trevithick
  { qid: 'Q313211', subject: 'inventions', kind: 'born' }, // Alberto Santos-Dumont
  { qid: 'Q212446', subject: 'inventions', kind: 'born' }, // Igor Sikorsky
  { qid: 'Q762', subject: 'inventions', kind: 'born' }, // Leonardo da Vinci
  { qid: 'Q4272245', subject: 'inventions', kind: 'born' }, // Auguste Lumière
  { qid: 'Q1962284', subject: 'inventions', kind: 'born' }, // Louis Lumière
  { qid: 'Q451052', subject: 'inventions', kind: 'born' }, // Percy Spencer
  { qid: 'Q21482', subject: 'inventions', kind: 'born' }, // Katharine Burr Blodgett
  { qid: 'Q7509', subject: 'inventions', kind: 'born' }, // Stephanie Kwolek
  { qid: 'Q312547', subject: 'inventions', kind: 'born' }, // Frank Whittle
  { qid: 'Q312680', subject: 'inventions', kind: 'born' }, // Ladislao Biro
  { qid: 'Q2581759', subject: 'inventions', kind: 'born' }, // Willis Carrier
  { qid: 'Q57098', subject: 'inventions', kind: 'born' }, // Gottlieb Daimler
  { qid: 'Q312', subject: 'inventions', kind: 'founded' }, // Apple Inc.
  { qid: 'Q2283', subject: 'inventions', kind: 'founded' }, // Microsoft
  { qid: 'Q95', subject: 'inventions', kind: 'founded' }, // Google
  { qid: 'Q37156', subject: 'inventions', kind: 'founded' }, // IBM
  { qid: 'Q53268', subject: 'inventions', kind: 'founded' }, // Toyota
  { qid: 'Q125006', subject: 'inventions', kind: 'opened' }, // Brooklyn Bridge
  { qid: 'Q193682', subject: 'inventions', kind: 'opened' }, // Kansai International Airport
  { qid: 'Q20075', subject: 'inventions', kind: 'opened' }, // London Underground
  { qid: 'Q1398696', subject: 'inventions', kind: 'opened' }, // Liverpool and Manchester Railway
  { qid: 'Q7350', subject: 'inventions', kind: 'opened' }, // Panama Canal
  { qid: 'Q54495', subject: 'inventions', kind: 'opened' }, // Sydney Harbour Bridge
  { qid: 'Q134883', subject: 'inventions', kind: 'opened' }, // CN Tower
  { qid: 'Q9188', subject: 'inventions', kind: 'opened' }, // Empire State Building
  { qid: 'Q49108', subject: 'inventions', kind: 'founded' }, // Massachusetts Institute of Technology
  { qid: 'Q951305', subject: 'inventions', kind: 'founded' }, // University of Cape Town
  { qid: 'Q13371', subject: 'inventions', kind: 'founded' }, // Harvard University
  { qid: 'Q91', subject: 'people', kind: 'born' }, // Abraham Lincoln
  { qid: 'Q23', subject: 'people', kind: 'born' }, // George Washington
  { qid: 'Q9439', subject: 'people', kind: 'born' }, // Queen Victoria
  { qid: 'Q8605', subject: 'people', kind: 'born' }, // Simón Bolívar
  { qid: 'Q1500', subject: 'people', kind: 'born' }, // José Rizal
  { qid: 'Q8573', subject: 'people', kind: 'born' }, // Sun Yat-sen
  { qid: 'Q7241', subject: 'people', kind: 'born' }, // Rabindranath Tagore
  { qid: 'Q215562', subject: 'people', kind: 'born' }, // Frederick Douglass
  { qid: 'Q211519', subject: 'people', kind: 'born' }, // Emmeline Pankhurst
  { qid: 'Q83396', subject: 'people', kind: 'born' }, // Eleanor Roosevelt
  { qid: 'Q49325', subject: 'people', kind: 'born' }, // Albert Schweitzer
  { qid: 'Q161672', subject: 'people', kind: 'born' }, // Patrice Lumumba
  { qid: 'Q202155', subject: 'people', kind: 'born' }, // Thomas Sankara
  { qid: 'Q214473', subject: 'people', kind: 'born' }, // Steve Biko
  { qid: 'Q41178', subject: 'people', kind: 'born' }, // Haile Selassie
  { qid: 'Q173563', subject: 'people', kind: 'born' }, // Jomo Kenyatta
  { qid: 'Q186525', subject: 'people', kind: 'born' }, // Julius Nyerere
  { qid: 'Q154545', subject: 'people', kind: 'born' }, // Léopold Sédar Senghor
  { qid: 'Q105480', subject: 'people', kind: 'born' }, // Kenneth Kaunda
  { qid: 'Q1047', subject: 'people', kind: 'born' }, // Jawaharlal Nehru
  { qid: 'Q231690', subject: 'people', kind: 'born' }, // B. R. Ambedkar
  { qid: 'Q250165', subject: 'people', kind: 'born' }, // Sarojini Naidu
  { qid: 'Q17293', subject: 'people', kind: 'born' }, // 14th Dalai Lama
  { qid: 'Q9513', subject: 'people', kind: 'born' }, // A. P. J. Abdul Kalam
  { qid: 'Q5588', subject: 'people', kind: 'born' }, // Frida Kahlo
  { qid: 'Q34189', subject: 'people', kind: 'born' }, // Pablo Neruda
  { qid: 'Q5878', subject: 'people', kind: 'born' }, // Gabriel García Márquez
  { qid: 'Q455072', subject: 'people', kind: 'born' }, // Kate Sheppard
  { qid: 'Q30547', subject: 'people', kind: 'born' }, // Mother Teresa
  { qid: 'Q76', subject: 'people', kind: 'born' }, // Barack Obama
  { qid: 'Q8016', subject: 'people', kind: 'born' }, // Winston Churchill
  { qid: 'Q41921', subject: 'people', kind: 'born' }, // Rosa Parks
  { qid: 'Q469860', subject: 'people', kind: 'born' }, // Ruby Bridges
  { qid: 'Q56434717', subject: 'people', kind: 'born' }, // Greta Thunberg
  { qid: 'Q8023', subject: 'people', kind: 'born' }, // Nelson Mandela
  { qid: 'Q146256', subject: 'people', kind: 'born' }, // Miriam Makeba
  { qid: 'Q313868', subject: 'people', kind: 'born' }, // Fela Kuti
  { qid: 'Q210734', subject: 'people', kind: 'born' }, // Youssou NDour
  { qid: 'Q313318', subject: 'people', kind: 'born' }, // Salif Keita
  { qid: 'Q231276', subject: 'people', kind: 'born' }, // Angélique Kidjo
  { qid: 'Q230141', subject: 'people', kind: 'born' }, // Chimamanda Ngozi Adichie
  { qid: 'Q302910', subject: 'people', kind: 'born' }, // Ngũgĩ wa Thiongo
  { qid: 'Q47619', subject: 'people', kind: 'born' }, // Nadine Gordimer
  { qid: 'Q7176', subject: 'people', kind: 'born' }, // Naguib Mahfouz
  { qid: 'Q244748', subject: 'people', kind: 'born' }, // Menelik II
  { qid: 'Q202006', subject: 'people', kind: 'born' }, // Olusegun Obasanjo
  { qid: 'Q181782', subject: 'people', kind: 'born' }, // Nnamdi Azikiwe
  { qid: 'Q226122', subject: 'people', kind: 'born' }, // Funmilayo Ransome-Kuti
  { qid: 'Q401032', subject: 'people', kind: 'born' }, // Ahmadu Bello
  { qid: 'Q960892', subject: 'people', kind: 'born' }, // Obafemi Awolowo
  { qid: 'Q1268', subject: 'arts', kind: 'born' }, // Frédéric Chopin
  { qid: 'Q7315', subject: 'arts', kind: 'born' }, // Pyotr Ilyich Tchaikovsky
  { qid: 'Q4030', subject: 'arts', kind: 'born' }, // Duke Ellington
  { qid: 'Q1768', subject: 'arts', kind: 'born' }, // Ella Fitzgerald
  { qid: 'Q1779', subject: 'arts', kind: 'born' }, // Louis Armstrong
  { qid: 'Q409', subject: 'arts', kind: 'born' }, // Bob Marley
  { qid: 'Q2831', subject: 'arts', kind: 'born' }, // Michael Jackson
  { qid: 'Q5593', subject: 'arts', kind: 'born' }, // Pablo Picasso
  { qid: 'Q296', subject: 'arts', kind: 'born' }, // Claude Monet
  { qid: 'Q5592', subject: 'arts', kind: 'born' }, // Michelangelo
  { qid: 'Q5598', subject: 'arts', kind: 'born' }, // Rembrandt
  { qid: 'Q5586', subject: 'arts', kind: 'born' }, // Katsushika Hokusai
  { qid: 'Q5686', subject: 'arts', kind: 'born' }, // Charles Dickens
  { qid: 'Q25161', subject: 'arts', kind: 'born' }, // Roald Dahl
  { qid: 'Q34660', subject: 'arts', kind: 'born' }, // J. K. Rowling
  { qid: 'Q55767', subject: 'arts', kind: 'born' }, // Astrid Lindgren
  { qid: 'Q298685', subject: 'arts', kind: 'born' }, // Dr. Seuss
  { qid: 'Q7245', subject: 'arts', kind: 'born' }, // Mark Twain
  { qid: 'Q19526', subject: 'arts', kind: 'born' }, // Maya Angelou
  { qid: 'Q12897', subject: 'arts', kind: 'born' }, // Pelé
  { qid: 'Q36107', subject: 'arts', kind: 'born' }, // Muhammad Ali
  { qid: 'Q11459', subject: 'arts', kind: 'born' }, // Serena Williams
  { qid: 'Q615', subject: 'arts', kind: 'born' }, // Lionel Messi
  { qid: 'Q11571', subject: 'arts', kind: 'born' }, // Cristiano Ronaldo
  { qid: 'Q33228', subject: 'arts', kind: 'born' }, // Nadia Comăneci
  { qid: 'Q41421', subject: 'arts', kind: 'born' }, // Michael Jordan
  { qid: 'Q1426', subject: 'arts', kind: 'born' }, // Roger Federer
  { qid: 'Q7520267', subject: 'arts', kind: 'born' }, // Simone Biles
  { qid: 'Q9124', subject: 'arts', kind: 'born' }, // Eliud Kipchoge
  { qid: 'Q171500', subject: 'arts', kind: 'born' }, // Haile Gebrselassie
  { qid: 'Q31083', subject: 'arts', kind: 'born' }, // Wilma Rudolph
  { qid: 'Q221048', subject: 'arts', kind: 'born' }, // Jackie Robinson
  { qid: 'Q16397', subject: 'arts', kind: 'born' }, // Bruce Lee
  { qid: 'Q9488', subject: 'arts', kind: 'born' }, // Sachin Tendulkar
  { qid: 'Q313591', subject: 'arts', kind: 'born' }, // Donald Bradman
  { qid: 'Q234762', subject: 'arts', kind: 'born' }, // Cathy Freeman
  { qid: 'Q234891', subject: 'arts', kind: 'born' }, // Yo-Yo Ma
  { qid: 'Q255', subject: 'arts', kind: 'born' }, // Ludwig van Beethoven
  { qid: 'Q83309', subject: 'arts', kind: 'born' }, // Johann Strauss II
  { qid: 'Q1340', subject: 'arts', kind: 'born' }, // Antonio Vivaldi
  { qid: 'Q7349', subject: 'arts', kind: 'born' }, // Joseph Haydn
  { qid: 'Q132232', subject: 'arts', kind: 'born' }, // Clara Schumann
  { qid: 'Q93341', subject: 'arts', kind: 'born' }, // Miles Davis
  { qid: 'Q174957', subject: 'arts', kind: 'born' }, // Nina Simone
  { qid: 'Q155845', subject: 'arts', kind: 'born' }, // Chinua Achebe
  { qid: 'Q41488', subject: 'arts', kind: 'born' }, // Wole Soyinka
  { qid: 'Q52985', subject: 'arts', kind: 'born' }, // Hergé
  { qid: 'Q8704', subject: 'arts', kind: 'born' }, // Walt Disney
  { qid: 'Q882', subject: 'arts', kind: 'born' }, // Charlie Chaplin
  { qid: 'Q8873', subject: 'arts', kind: 'born' }, // Satyajit Ray
  { qid: 'Q8006', subject: 'arts', kind: 'born' }, // Akira Kurosawa
  { qid: 'Q314966', subject: 'arts', kind: 'born' }, // Ousmane Sembène
  { qid: 'Q55400', subject: 'arts', kind: 'born' }, // Hayao Miyazaki
  { qid: 'Q457420', subject: 'arts', kind: 'born' }, // Wangechi Mutu
  { qid: 'Q74287', subject: 'arts', kind: 'published' }, // The Hobbit
  { qid: 'Q43361', subject: 'arts', kind: 'published' }, // Harry Potter and the Philosophers Stone
  { qid: 'Q130295', subject: 'arts', kind: 'published' }, // The Wonderful Wizard of Oz
  { qid: 'Q25338', subject: 'arts', kind: 'published' }, // The Little Prince
  { qid: 'Q185118', subject: 'arts', kind: 'published' }, // Treasure Island
  { qid: 'Q62879', subject: 'arts', kind: 'published' }, // A Christmas Carol
  { qid: 'Q36479', subject: 'arts', kind: 'published' }, // The Lion King
  { qid: 'Q19675', subject: 'arts', kind: 'founded' }, // Louvre
  { qid: 'Q127552', subject: 'arts', kind: 'founded' }, // Pixar
  { qid: 'Q8093', subject: 'arts', kind: 'founded' }, // Nintendo
  { qid: 'Q45178', subject: 'arts', kind: 'opened' }, // Sydney Opera House
  { qid: 'Q179199', subject: 'arts', kind: 'opened' }, // Guggenheim Museum Bilbao
  { qid: 'Q2583681', subject: 'arts', kind: 'opened' }, // Grand Egyptian Museum
  { qid: 'Q59521062', subject: 'arts', kind: 'opened' }, // Museum of Black Civilisations
  { qid: 'Q169759', subject: 'ancient', kind: 'published' }, // Declaration of the Rights of Man and of the Citizen
  { qid: 'Q835309', subject: 'ancient', kind: 'discovered' }, // Tutankhamuns tomb
  { qid: 'Q48584', subject: 'ancient', kind: 'discovered' }, // Rosetta Stone
  { qid: 'Q47672', subject: 'ancient', kind: 'discovered' }, // Terracotta Army
  { qid: 'Q172125', subject: 'ancient', kind: 'discovered' }, // Lascaux
  { qid: 'Q61', subject: 'ancient', kind: 'founded' }, // Washington, D.C.
  { qid: 'Q2844', subject: 'ancient', kind: 'founded' }, // Brasília
  { qid: 'Q3114', subject: 'ancient', kind: 'founded' }, // Canberra
  { qid: 'Q85', subject: 'ancient', kind: 'founded' }, // Cairo
  { qid: 'Q458', subject: 'ancient', kind: 'founded' }, // European Union
  { qid: 'Q7184', subject: 'ancient', kind: 'founded' }, // NATO
  { qid: 'Q7768', subject: 'ancient', kind: 'founded' }, // ASEAN
  { qid: 'Q340195', subject: 'ancient', kind: 'founded' }, // African Development Bank
  { qid: 'Q1781959', subject: 'ancient', kind: 'founded' }, // Nobel Foundation
  { qid: 'Q899', subject: 'ancient', kind: 'opened' }, // Suez Canal
  { qid: 'Q1315213', subject: 'earth', kind: 'founded', continent: 'Antarctica' }, // Davis Station
  { qid: 'Q51', subject: 'earth', kind: 'discovered', continent: 'Antarctica' }, // Antarctica
  { qid: 'Q781331', subject: 'earth', kind: 'founded', continent: 'Antarctica' }, // Australian Antarctic Division
  { qid: 'Q560086', subject: 'people', kind: 'born' }, // Albert Namatjira
  { qid: 'Q52659', subject: 'people', kind: 'born' }, // Peter Snell
  { qid: 'Q363717', subject: 'people', kind: 'born' }, // Jonah Lomu
  { qid: 'Q229040', subject: 'people', kind: 'born' }, // Dawn Fraser
  { qid: 'Q185044', subject: 'people', kind: 'born' }, // Ian Thorpe
  { qid: 'Q13476175', subject: 'people', kind: 'born' }, // Lorde
  { qid: 'Q2388576', subject: 'people', kind: 'born' }, // Taika Waititi
  { qid: 'Q4465', subject: 'people', kind: 'born' }, // Peter Jackson
  { qid: 'Q3606816', subject: 'people', kind: 'born' }, // Jacinda Ardern
  { qid: 'Q436699', subject: 'people', kind: 'born' }, // Banjo Paterson
  { qid: 'Q129187', subject: 'people', kind: 'born' }, // Patrick White
  { qid: 'Q230499', subject: 'arts', kind: 'born' }, // Violeta Parra
  { qid: 'Q229613', subject: 'arts', kind: 'born' }, // Carlos Gardel
  { qid: 'Q203514', subject: 'arts', kind: 'born' }, // Heitor Villa-Lobos
  { qid: 'Q134165', subject: 'arts', kind: 'born' }, // Oscar Niemeyer
  { qid: 'Q171128', subject: 'arts', kind: 'born' }, // Diego Rivera
  { qid: 'Q272877', subject: 'arts', kind: 'born' }, // Fernando Botero
  { qid: 'Q909', subject: 'arts', kind: 'born' }, // Jorge Luis Borges
  { qid: 'Q39803', subject: 'arts', kind: 'born' }, // Mario Vargas Llosa
  { qid: 'Q80871', subject: 'arts', kind: 'born' }, // Gabriela Mistral
  { qid: 'Q10490', subject: 'arts', kind: 'born' }, // Ayrton Senna
  { qid: 'Q142794', subject: 'arts', kind: 'born' }, // Neymar
  { qid: 'Q34424', subject: 'arts', kind: 'born' }, // Shakira
  { qid: 'Q28973866', subject: 'arts', kind: 'born' }, // Vinicius Júnior
  { qid: 'Q180553', subject: 'arts', kind: 'born' }, // Alexis Sánchez
  { qid: 'Q10132', subject: 'arts', kind: 'born' }, // Rafael Nadal
  { qid: 'Q5812', subject: 'arts', kind: 'born' }, // Novak Djokovic
  { qid: 'Q182276', subject: 'people', kind: 'born' }, // Benito Juárez
  { qid: 'Q156774', subject: 'people', kind: 'born' }, // Pedro II of Brazil
  { qid: 'Q134160', subject: 'people', kind: 'born' }, // José de San Martín
  { qid: 'Q28930', subject: 'people', kind: 'born' }, // Bernardo OHiggins
  { qid: 'Q1343024', subject: 'inventions', kind: 'born' }, // René Favaloro
  { qid: 'Q317643', subject: 'space', kind: 'born' }, // Marcos Pontes
  { qid: 'Q360433', subject: 'space', kind: 'born' }, // Franklin Chang-Díaz
];
