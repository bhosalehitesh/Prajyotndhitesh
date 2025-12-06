package com.smartbiz.sakhistore.modules.pincode.util;

import com.smartbiz.sakhistore.modules.pincode.model.Pincode;
import com.smartbiz.sakhistore.modules.pincode.service.PincodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Comprehensive data loader for all Indian states with districts and cities/towns
 * Includes extensive coverage of districts and cities across all states
 */
@Component
@RequiredArgsConstructor
public class PincodeDataLoader implements CommandLineRunner {
    
    private final PincodeService pincodeService;
    
    @Override
    public void run(String... args) {
        // Only load if database is empty
        if (pincodeService.getAllStates().isEmpty()) {
            loadComprehensivePincodeData();
        }
    }
    
    private void loadComprehensivePincodeData() {
        List<Pincode> pincodes = new ArrayList<>();
        
        // ========== ANDHRA PRADESH (26 Districts) ==========
        addDistrictsAndCities(pincodes, "Andhra Pradesh", new String[][]{
            {"Visakhapatnam", "Visakhapatnam", "530001"}, {"Vijayawada", "Krishna", "520001"}, 
            {"Guntur", "Guntur", "522001"}, {"Nellore", "Nellore", "524001"}, 
            {"Kurnool", "Kurnool", "518001"}, {"Rajahmundry", "East Godavari", "533101"},
            {"Tirupati", "Chittoor", "517501"}, {"Kakinada", "East Godavari", "533001"}, 
            {"Kadapa", "YSR Kadapa", "516001"}, {"Anantapur", "Anantapur", "515001"}, 
            {"Eluru", "West Godavari", "534001"}, {"Ongole", "Prakasam", "523001"},
            {"Chittoor", "Chittoor", "517001"}, {"Machilipatnam", "Krishna", "521001"},
            {"Srikakulam", "Srikakulam", "532001"}, {"Vizianagaram", "Vizianagaram", "535001"},
            {"Tenali", "Guntur", "522201"}, {"Proddatur", "YSR Kadapa", "516360"},
            {"Tadepalligudem", "West Godavari", "534101"}, {"Narasaraopet", "Guntur", "522601"},
            {"Chilakaluripet", "Guntur", "522616"}, {"Bhimavaram", "West Godavari", "534202"},
            {"Nandyal", "Kurnool", "518501"}, {"Hindupur", "Anantapur", "515201"},
            {"Adoni", "Kurnool", "518301"}, {"Markapur", "Prakasam", "523316"}
        });
        
        // ========== ARUNACHAL PRADESH (26 Districts) ==========
        addDistrictsAndCities(pincodes, "Arunachal Pradesh", new String[][]{
            {"Itanagar", "Papum Pare", "791111"}, {"Naharlagun", "Papum Pare", "791110"}, 
            {"Pasighat", "East Siang", "791102"}, {"Tawang", "Tawang", "790104"}, 
            {"Ziro", "Lower Subansiri", "791120"}, {"Bomdila", "West Kameng", "790001"},
            {"Tezu", "Lohit", "792001"}, {"Roing", "Lower Dibang Valley", "792110"},
            {"Along", "West Siang", "791001"}, {"Daporijo", "Upper Subansiri", "791122"},
            {"Yingkiong", "Upper Siang", "791102"}, {"Koloriang", "Kurung Kumey", "791118"},
            {"Anini", "Dibang Valley", "792103"}, {"Khonsa", "Tirap", "786630"},
            {"Longding", "Longding", "786601"}, {"Namsai", "Namsai", "792103"}
        });
        
        // ========== ASSAM (35 Districts) ==========
        addDistrictsAndCities(pincodes, "Assam", new String[][]{
            {"Guwahati", "Kamrup Metropolitan", "781001"}, {"Silchar", "Cachar", "788001"}, 
            {"Dibrugarh", "Dibrugarh", "786001"}, {"Jorhat", "Jorhat", "785001"}, 
            {"Nagaon", "Nagaon", "782001"}, {"Tinsukia", "Tinsukia", "786125"},
            {"Tezpur", "Sonitpur", "784001"}, {"Bongaigaon", "Bongaigaon", "783380"}, 
            {"Dhubri", "Dhubri", "783301"}, {"Sivasagar", "Sivasagar", "785640"}, 
            {"Goalpara", "Goalpara", "783101"}, {"Barpeta", "Barpeta", "781301"},
            {"Karimganj", "Karimganj", "788710"}, {"Hailakandi", "Hailakandi", "788151"},
            {"Dhemaji", "Dhemaji", "787057"}, {"Lakhimpur", "Lakhimpur", "787001"},
            {"Morigaon", "Morigaon", "782105"}, {"Nalbari", "Nalbari", "781335"},
            {"Baksa", "Baksa", "781301"}, {"Chirang", "Chirang", "784101"},
            {"Kokrajhar", "Kokrajhar", "783370"}, {"Udalguri", "Udalguri", "784509"},
            {"Dima Hasao", "Dima Hasao", "788819"}, {"Karbi Anglong", "Karbi Anglong", "782460"},
            {"West Karbi Anglong", "West Karbi Anglong", "782480"}
        });
        
        // ========== BIHAR (38 Districts) ==========
        addDistrictsAndCities(pincodes, "Bihar", new String[][]{
            {"Patna", "Patna", "800001"}, {"Gaya", "Gaya", "823001"}, 
            {"Bhagalpur", "Bhagalpur", "812001"}, {"Muzaffarpur", "Muzaffarpur", "842001"}, 
            {"Purnia", "Purnia", "854301"}, {"Darbhanga", "Darbhanga", "846004"}, 
            {"Arrah", "Bhojpur", "802301"}, {"Katihar", "Katihar", "854105"}, 
            {"Munger", "Munger", "811201"}, {"Chapra", "Saran", "841301"}, 
            {"Begusarai", "Begusarai", "851101"}, {"Saharsa", "Saharsa", "852201"},
            {"Sitamarhi", "Sitamarhi", "843301"}, {"Samastipur", "Samastipur", "848101"},
            {"Motihari", "East Champaran", "845401"}, {"Siwan", "Siwan", "841226"},
            {"Hajipur", "Vaishali", "844101"}, {"Bettiah", "West Champaran", "845438"},
            {"Madhepura", "Madhepura", "852113"}, {"Supaul", "Supaul", "852131"},
            {"Araria", "Araria", "854311"}, {"Kishanganj", "Kishanganj", "855107"},
            {"Sheikhpura", "Sheikhpura", "811105"}, {"Lakhisarai", "Lakhisarai", "811311"},
            {"Sheohar", "Sheohar", "843329"}, {"Aurangabad", "Aurangabad", "824101"},
            {"Nawada", "Nawada", "805110"}, {"Jamui", "Jamui", "811307"},
            {"Banka", "Banka", "813102"}, {"Rohtas", "Rohtas", "821305"}
        });
        
        // ========== CHHATTISGARH (33 Districts) ==========
        addDistrictsAndCities(pincodes, "Chhattisgarh", new String[][]{
            {"Raipur", "Raipur", "492001"}, {"Bhilai", "Durg", "490001"}, 
            {"Bilaspur", "Bilaspur", "495001"}, {"Durg", "Durg", "491001"}, 
            {"Korba", "Korba", "495677"}, {"Raigarh", "Raigarh", "496001"}, 
            {"Jagdalpur", "Bastar", "494001"}, {"Ambikapur", "Surguja", "497001"}, 
            {"Rajnandgaon", "Rajnandgaon", "491441"}, {"Dhamtari", "Dhamtari", "493773"}, 
            {"Mahasamund", "Mahasamund", "493445"}, {"Kanker", "Kanker", "494334"},
            {"Janjgir", "Janjgir-Champa", "495668"}, {"Baloda Bazar", "Baloda Bazar", "493332"},
            {"Bemetara", "Bemetara", "491335"}, {"Bijapur", "Bijapur", "494444"},
            {"Dantewada", "Dantewada", "494449"}, {"Gariaband", "Gariaband", "493889"},
            {"Kondagaon", "Kondagaon", "494226"}, {"Mungeli", "Mungeli", "495334"},
            {"Narayanpur", "Narayanpur", "494661"}, {"Sukma", "Sukma", "494111"}
        });
        
        // ========== GOA (2 Districts) ==========
        addDistrictsAndCities(pincodes, "Goa", new String[][]{
            {"Panaji", "North Goa", "403001"}, {"Margao", "South Goa", "403601"}, 
            {"Vasco da Gama", "South Goa", "403802"}, {"Mapusa", "North Goa", "403507"}, 
            {"Ponda", "North Goa", "403401"}, {"Mormugao", "South Goa", "403803"},
            {"Bicholim", "North Goa", "403504"}, {"Curchorem", "South Goa", "403706"},
            {"Valpoi", "North Goa", "403506"}, {"Canacona", "South Goa", "403702"}
        });
        
        // ========== GUJARAT (33 Districts) ==========
        addDistrictsAndCities(pincodes, "Gujarat", new String[][]{
            {"Ahmedabad", "Ahmedabad", "380001"}, {"Surat", "Surat", "395001"}, 
            {"Vadodara", "Vadodara", "390001"}, {"Rajkot", "Rajkot", "360001"}, 
            {"Bhavnagar", "Bhavnagar", "364001"}, {"Jamnagar", "Jamnagar", "361001"}, 
            {"Gandhinagar", "Gandhinagar", "382010"}, {"Junagadh", "Junagadh", "362001"}, 
            {"Gandhidham", "Kutch", "370201"}, {"Anand", "Anand", "388001"}, 
            {"Bharuch", "Bharuch", "392001"}, {"Mehsana", "Mehsana", "384001"},
            {"Bhuj", "Kutch", "370001"}, {"Surendranagar", "Surendranagar", "363001"},
            {"Navsari", "Navsari", "396445"}, {"Valsad", "Valsad", "396001"},
            {"Palanpur", "Banaskantha", "385001"}, {"Himmatnagar", "Sabarkantha", "383001"},
            {"Godhra", "Panchmahal", "389001"}, {"Veraval", "Gir Somnath", "362265"},
            {"Porbandar", "Porbandar", "360575"}, {"Botad", "Botad", "364710"},
            {"Chhota Udaipur", "Chhota Udaipur", "391165"}, {"Dahod", "Dahod", "389151"},
            {"Devbhoomi Dwarka", "Devbhoomi Dwarka", "361335"}, {"Gir Somnath", "Gir Somnath", "362265"},
            {"Mahisagar", "Mahisagar", "388710"}, {"Morbi", "Morbi", "363641"},
            {"Narmada", "Narmada", "393135"}, {"Tapi", "Tapi", "394635"}
        });
        
        // ========== HARYANA (22 Districts) ==========
        addDistrictsAndCities(pincodes, "Haryana", new String[][]{
            {"Gurgaon", "Gurugram", "122001"}, {"Faridabad", "Faridabad", "121001"}, 
            {"Panipat", "Panipat", "132103"}, {"Ambala", "Ambala", "133001"}, 
            {"Yamunanagar", "Yamunanagar", "135001"}, {"Rohtak", "Rohtak", "124001"}, 
            {"Hisar", "Hisar", "125001"}, {"Karnal", "Karnal", "132001"}, 
            {"Sonipat", "Sonipat", "131001"}, {"Panchkula", "Panchkula", "134109"}, 
            {"Bhiwani", "Bhiwani", "127021"}, {"Rewari", "Rewari", "123401"},
            {"Kaithal", "Kaithal", "136027"}, {"Jind", "Jind", "126102"},
            {"Sirsa", "Sirsa", "125055"}, {"Palwal", "Palwal", "121102"},
            {"Bahadurgarh", "Jhajjar", "124507"}, {"Thanesar", "Kurukshetra", "136118"},
            {"Narnaul", "Mahendragarh", "123001"}, {"Fatehabad", "Fatehabad", "125050"},
            {"Charkhi Dadri", "Charkhi Dadri", "127306"}, {"Nuh", "Nuh", "122107"}
        });
        
        // ========== HIMACHAL PRADESH (12 Districts) ==========
        addDistrictsAndCities(pincodes, "Himachal Pradesh", new String[][]{
            {"Shimla", "Shimla", "171001"}, {"Mandi", "Mandi", "175001"}, 
            {"Solan", "Solan", "173212"}, {"Dharamshala", "Kangra", "176215"}, 
            {"Kullu", "Kullu", "175101"}, {"Chamba", "Chamba", "176310"}, 
            {"Bilaspur", "Bilaspur", "174001"}, {"Hamirpur", "Hamirpur", "177001"}, 
            {"Una", "Una", "174303"}, {"Kangra", "Kangra", "176001"}, 
            {"Nahan", "Sirmaur", "173001"}, {"Palampur", "Kangra", "176061"},
            {"Baddi", "Solan", "173205"}, {"Parwanoo", "Solan", "173220"},
            {"Keylong", "Lahaul and Spiti", "175132"}, {"Reckong Peo", "Kinnaur", "172107"}
        });
        
        // ========== JHARKHAND (24 Districts) ==========
        addDistrictsAndCities(pincodes, "Jharkhand", new String[][]{
            {"Ranchi", "Ranchi", "834001"}, {"Jamshedpur", "East Singhbhum", "831001"}, 
            {"Dhanbad", "Dhanbad", "826001"}, {"Bokaro", "Bokaro", "827001"}, 
            {"Hazaribagh", "Hazaribagh", "825301"}, {"Deoghar", "Deoghar", "814112"}, 
            {"Giridih", "Giridih", "815301"}, {"Ramgarh", "Ramgarh", "829122"}, 
            {"Medininagar", "Palamu", "822101"}, {"Chaibasa", "West Singhbhum", "833201"}, 
            {"Dumka", "Dumka", "814101"}, {"Phusro", "Bokaro", "829144"},
            {"Chatra", "Chatra", "825401"}, {"Gumla", "Gumla", "835207"},
            {"Koderma", "Koderma", "825410"}, {"Latehar", "Latehar", "829206"},
            {"Lohardaga", "Lohardaga", "835302"}, {"Pakur", "Pakur", "816107"},
            {"Sahebganj", "Sahebganj", "816109"}, {"Simdega", "Simdega", "835223"},
            {"Khunti", "Khunti", "835210"}, {"Saraikela Kharsawan", "Saraikela Kharsawan", "833219"}
        });
        
        // ========== KARNATAKA (31 Districts) ==========
        addDistrictsAndCities(pincodes, "Karnataka", new String[][]{
            {"Bangalore", "Bangalore Urban", "560001"}, {"Mysore", "Mysuru", "570001"}, 
            {"Hubli", "Dharwad", "580020"}, {"Mangalore", "Dakshina Kannada", "575001"}, 
            {"Belgaum", "Belagavi", "590001"}, {"Gulbarga", "Kalaburagi", "585101"}, 
            {"Davangere", "Davangere", "577001"}, {"Bellary", "Ballari", "583101"}, 
            {"Bijapur", "Vijayapura", "586101"}, {"Shimoga", "Shivamogga", "577201"}, 
            {"Tumkur", "Tumakuru", "572101"}, {"Udupi", "Udupi", "576101"},
            {"Raichur", "Raichur", "584101"}, {"Bidar", "Bidar", "585401"},
            {"Hassan", "Hassan", "573201"}, {"Chitradurga", "Chitradurga", "577501"},
            {"Kolar", "Kolar", "563101"}, {"Mandya", "Mandya", "571401"},
            {"Chikkamagaluru", "Chikkamagaluru", "577101"}, {"Bagalkot", "Bagalkot", "587101"},
            {"Chamarajanagar", "Chamarajanagar", "571313"}, {"Chikkaballapur", "Chikkaballapur", "562101"},
            {"Gadag", "Gadag", "582101"}, {"Haveri", "Haveri", "581110"},
            {"Kodagu", "Kodagu", "571201"}, {"Koppal", "Koppal", "583231"},
            {"Vijayapura", "Vijayapura", "586101"}, {"Yadgir", "Yadgir", "585201"}
        });
        
        // ========== KERALA (14 Districts) ==========
        addDistrictsAndCities(pincodes, "Kerala", new String[][]{
            {"Kochi", "Ernakulam", "682001"}, {"Thiruvananthapuram", "Thiruvananthapuram", "695001"}, 
            {"Kozhikode", "Kozhikode", "673001"}, {"Thrissur", "Thrissur", "680001"}, 
            {"Kollam", "Kollam", "691001"}, {"Alappuzha", "Alappuzha", "688001"}, 
            {"Kannur", "Kannur", "670001"}, {"Kottayam", "Kottayam", "686001"}, 
            {"Palakkad", "Palakkad", "678001"}, {"Malappuram", "Malappuram", "676505"}, 
            {"Pathanamthitta", "Pathanamthitta", "689645"}, {"Kasaragod", "Kasaragod", "671121"},
            {"Idukki", "Idukki", "685501"}, {"Wayanad", "Wayanad", "673121"},
            {"Manjeri", "Malappuram", "676121"}, {"Thalassery", "Kannur", "670101"}
        });
        
        // ========== MADHYA PRADESH (55 Districts) ==========
        addDistrictsAndCities(pincodes, "Madhya Pradesh", new String[][]{
            {"Indore", "Indore", "452001"}, {"Bhopal", "Bhopal", "462001"}, 
            {"Gwalior", "Gwalior", "474001"}, {"Jabalpur", "Jabalpur", "482001"}, 
            {"Ujjain", "Ujjain", "456001"}, {"Sagar", "Sagar", "470001"}, 
            {"Dewas", "Dewas", "455001"}, {"Satna", "Satna", "485001"}, 
            {"Ratlam", "Ratlam", "457001"}, {"Rewa", "Rewa", "486001"}, 
            {"Chhindwara", "Chhindwara", "480001"}, {"Morena", "Morena", "476001"},
            {"Bhind", "Bhind", "477001"}, {"Guna", "Guna", "473001"},
            {"Shivpuri", "Shivpuri", "473551"}, {"Vidisha", "Vidisha", "464001"},
            {"Khandwa", "Khandwa", "450001"}, {"Burhanpur", "Burhanpur", "450331"},
            {"Neemuch", "Neemuch", "458441"}, {"Mandsaur", "Mandsaur", "458001"},
            {"Alirajpur", "Alirajpur", "457887"}, {"Anuppur", "Anuppur", "484224"},
            {"Ashoknagar", "Ashoknagar", "473331"}, {"Balaghat", "Balaghat", "481001"},
            {"Barwani", "Barwani", "451551"}, {"Betul", "Betul", "460001"},
            {"Dhar", "Dhar", "454001"}, {"Dindori", "Dindori", "481880"},
            {"Harda", "Harda", "461331"}, {"Hoshangabad", "Hoshangabad", "461001"},
            {"Katni", "Katni", "483501"}, {"Khargone", "Khargone", "451001"},
            {"Mandla", "Mandla", "481661"}, {"Narsinghpur", "Narsinghpur", "487001"},
            {"Panna", "Panna", "488001"}, {"Raisen", "Raisen", "464551"},
            {"Rajgarh", "Rajgarh", "465661"}, {"Sehore", "Sehore", "466001"},
            {"Seoni", "Seoni", "480661"}, {"Sheopur", "Sheopur", "476337"},
            {"Shahdol", "Shahdol", "484001"}, {"Sidhi", "Sidhi", "486661"},
            {"Singrauli", "Singrauli", "486889"}, {"Tikamgarh", "Tikamgarh", "472001"},
            {"Umaria", "Umaria", "484551"}
        });
        
        // ========== MAHARASHTRA (36 Districts) ==========
        addDistrictsAndCities(pincodes, "Maharashtra", new String[][]{
            {"Mumbai", "Mumbai", "400001"}, {"Pune", "Pune", "411001"}, 
            {"Nagpur", "Nagpur", "440001"}, {"Thane", "Thane", "400601"}, 
            {"Nashik", "Nashik", "422001"}, {"Aurangabad", "Aurangabad", "431001"}, 
            {"Solapur", "Solapur", "413001"}, {"Kalyan", "Thane", "421301"}, 
            {"Vasai", "Palghar", "401201"}, {"Navi Mumbai", "Thane", "400703"}, 
            {"Amravati", "Amravati", "444601"}, {"Kolhapur", "Kolhapur", "416001"}, 
            {"Sangli", "Sangli", "416416"}, {"Jalgaon", "Jalgaon", "425001"}, 
            {"Latur", "Latur", "413512"}, {"Ahmednagar", "Ahmednagar", "414001"}, 
            {"Chandrapur", "Chandrapur", "442401"}, {"Parbhani", "Parbhani", "431401"}, 
            {"Ichalkaranji", "Kolhapur", "416115"}, {"Jalna", "Jalna", "431203"}, 
            {"Bhusawal", "Jalgaon", "425201"}, {"Panvel", "Raigad", "410206"}, 
            {"Satara", "Satara", "415001"}, {"Beed", "Beed", "431122"}, 
            {"Yavatmal", "Yavatmal", "445001"}, {"Kamptee", "Nagpur", "441001"}, 
            {"Gondia", "Gondia", "441601"}, {"Barshi", "Solapur", "413401"}, 
            {"Achalpur", "Amravati", "444805"}, {"Osmanabad", "Osmanabad", "413501"}, 
            {"Nanded", "Nanded", "431601"}, {"Wardha", "Wardha", "442001"}, 
            {"Udgir", "Latur", "413517"}, {"Akola", "Akola", "444001"}, 
            {"Nandurbar", "Nandurbar", "425412"}, {"Miraj", "Sangli", "416410"},
            {"Ratnagiri", "Ratnagiri", "415612"}, {"Dhule", "Dhule", "424001"},
            {"Sindhudurg", "Sindhudurg", "416812"}, {"Raigad", "Raigad", "402101"},
            {"Palghar", "Palghar", "401404"}, {"Buldhana", "Buldhana", "443001"},
            {"Hingoli", "Hingoli", "431513"}, {"Washim", "Washim", "444505"},
            {"Gadchiroli", "Gadchiroli", "442605"}, {"Bhandara", "Bhandara", "441904"},
            {"Akot", "Akola", "444101"}, {"Akluj", "Solapur", "413101"},
            {"Alibag", "Raigad", "402201"}, {"Amalner", "Jalgaon", "425401"},
            {"Ambajogai", "Beed", "431517"}, {"Ambejogai", "Beed", "431517"},
            {"Arvi", "Wardha", "442201"}, {"Ashta", "Sangli", "416301"},
            {"Atpadi", "Sangli", "415301"}, {"Ausa", "Latur", "413520"},
            {"Badlapur", "Thane", "421503"}, {"Baramati", "Pune", "413102"},
            {"Bardoli", "Surat", "394601"}, {"Barshi", "Solapur", "413401"},
            {"Basmat", "Hingoli", "431512"}, {"Bhandara", "Bhandara", "441904"},
            {"Bhiwandi", "Thane", "421302"}, {"Bhusawal", "Jalgaon", "425201"},
            {"Bid", "Bid", "431122"}, {"Boisar", "Palghar", "401501"},
            {"Chalisgaon", "Jalgaon", "424101"}, {"Chandrapur", "Chandrapur", "442401"},
            {"Chiplun", "Ratnagiri", "415605"}, {"Dahanu", "Palghar", "401601"},
            {"Dapoli", "Ratnagiri", "415712"}, {"Deolali", "Nashik", "422401"},
            {"Deulgaon Raja", "Buldhana", "443204"}, {"Dharangaon", "Jalgaon", "425105"},
            {"Dharmabad", "Nanded", "431809"}, {"Dharwad", "Dharwad", "580001"},
            {"Digras", "Yavatmal", "445203"}, {"Dombivli", "Thane", "421201"},
            {"Gadhinglaj", "Kolhapur", "416502"}, {"Gadchiroli", "Gadchiroli", "442605"},
            {"Gangakhed", "Parbhani", "431514"}, {"Gangapur", "Aurangabad", "431109"},
            {"Georai", "Beed", "431127"}, {"Gondia", "Gondia", "441601"},
            {"Goregaon", "Mumbai", "400062"}, {"Hadapsar", "Pune", "411028"},
            {"Hinganghat", "Wardha", "442301"}, {"Hingoli", "Hingoli", "431513"},
            {"Ichalkaranji", "Kolhapur", "416115"}, {"Igatpuri", "Nashik", "422403"},
            {"Jalgaon", "Jalgaon", "425001"}, {"Jalna", "Jalna", "431203"},
            {"Jamkhed", "Ahmednagar", "413201"}, {"Jawhar", "Palghar", "401603"},
            {"Jintur", "Parbhani", "431508"}, {"Junnar", "Pune", "410502"},
            {"Kagal", "Kolhapur", "416216"}, {"Kalamb", "Osmanabad", "413507"},
            {"Kalyan", "Thane", "421301"}, {"Kamptee", "Nagpur", "441001"},
            {"Kankavli", "Sindhudurg", "416602"}, {"Karad", "Satara", "415110"},
            {"Karjat", "Raigad", "410201"}, {"Karmala", "Solapur", "413203"},
            {"Karvir", "Kolhapur", "416001"}, {"Khadakwasla", "Pune", "411021"},
            {"Khamgaon", "Buldhana", "444303"}, {"Khed", "Pune", "410501"},
            {"Khopoli", "Raigad", "410203"}, {"Khultabad", "Aurangabad", "431002"},
            {"Kinwat", "Nanded", "431804"}, {"Kolhapur", "Kolhapur", "416001"},
            {"Kopargaon", "Ahmednagar", "423601"}, {"Koregaon", "Satara", "415501"},
            {"Kudal", "Sindhudurg", "416520"}, {"Kurduwadi", "Solapur", "413208"},
            {"Latur", "Latur", "413512"}, {"Lonavala", "Pune", "410401"},
            {"Madha", "Solapur", "413209"}, {"Mahabaleshwar", "Satara", "412806"},
            {"Mahad", "Raigad", "402301"}, {"Malegaon", "Nashik", "423203"},
            {"Malkapur", "Buldhana", "443101"}, {"Manchar", "Pune", "410503"},
            {"Mangalwedha", "Solapur", "413305"}, {"Manmad", "Nashik", "423104"},
            {"Manor", "Palghar", "401401"}, {"Mansar", "Nagpur", "441401"},
            {"Mhaswad", "Satara", "415509"}, {"Miraj", "Sangli", "416410"},
            {"Morshi", "Amravati", "444905"}, {"Mukhed", "Nanded", "431806"},
            {"Mul", "Chandrapur", "441224"}, {"Mumbai", "Mumbai", "400001"},
            {"Murbad", "Thane", "421401"}, {"Murud", "Raigad", "402401"},
            {"Nagpur", "Nagpur", "440001"}, {"Nalasopara", "Palghar", "401203"},
            {"Nanded", "Nanded", "431601"}, {"Nandgaon", "Nashik", "423106"},
            {"Nandurbar", "Nandurbar", "425412"}, {"Narkhed", "Nagpur", "441304"},
            {"Nashik", "Nashik", "422001"}, {"Navapur", "Nandurbar", "425416"},
            {"Navi Mumbai", "Thane", "400703"}, {"Ner", "Nagpur", "441106"},
            {"Niphad", "Nashik", "422303"}, {"Osmanabad", "Osmanabad", "413501"},
            {"Pachora", "Jalgaon", "424201"}, {"Paithan", "Aurangabad", "431107"},
            {"Palghar", "Palghar", "401404"}, {"Pandharpur", "Solapur", "413304"},
            {"Panvel", "Raigad", "410206"}, {"Paranda", "Osmanabad", "413502"},
            {"Parbhani", "Parbhani", "431401"}, {"Parli", "Beed", "431515"},
            {"Parner", "Ahmednagar", "414302"}, {"Partur", "Jalna", "431501"},
            {"Patoda", "Beed", "431516"}, {"Pen", "Raigad", "402107"},
            {"Phaltan", "Satara", "415523"}, {"Pimpalner", "Dhule", "424306"},
            {"Pune", "Pune", "411001"}, {"Pusad", "Yavatmal", "445204"},
            {"Radhanagari", "Kolhapur", "416212"}, {"Rahata", "Ahmednagar", "423107"},
            {"Rahuri", "Ahmednagar", "413705"}, {"Rajapur", "Ratnagiri", "416702"},
            {"Rajgurunagar", "Pune", "410505"}, {"Rajura", "Chandrapur", "442905"},
            {"Ralegaon", "Yavatmal", "445402"}, {"Ramtek", "Nagpur", "441106"},
            {"Ratnagiri", "Ratnagiri", "415612"}, {"Raver", "Jalgaon", "425508"},
            {"Renapur", "Latur", "413527"}, {"Roha", "Raigad", "402109"},
            {"Sakri", "Dhule", "424304"}, {"Sangamner", "Ahmednagar", "422605"},
            {"Sangli", "Sangli", "416416"}, {"Sangole", "Solapur", "413307"},
            {"Saswad", "Pune", "412301"}, {"Satara", "Satara", "415001"},
            {"Savda", "Jalgaon", "425502"}, {"Savner", "Nagpur", "441107"},
            {"Selu", "Parbhani", "431503"}, {"Shahada", "Nandurbar", "425409"},
            {"Shahapur", "Thane", "421601"}, {"Shegaon", "Buldhana", "444203"},
            {"Shendurjana", "Amravati", "444901"}, {"Shirol", "Kolhapur", "416103"},
            {"Shirdi", "Ahmednagar", "423109"}, {"Shirpur", "Dhule", "425405"},
            {"Shirur", "Pune", "412210"}, {"Shrigonda", "Ahmednagar", "413701"},
            {"Shrirampur", "Ahmednagar", "413709"}, {"Sillod", "Aurangabad", "431112"},
            {"Sindhudurg", "Sindhudurg", "416812"}, {"Sinnar", "Nashik", "422103"},
            {"Sironcha", "Gadchiroli", "442904"}, {"Solapur", "Solapur", "413001"},
            {"Sonpeth", "Parbhani", "431504"}, {"Soyagaon", "Jalgaon", "425304"},
            {"Surgana", "Nashik", "422211"}, {"Talegaon Dabhade", "Pune", "410506"},
            {"Taloda", "Nandurbar", "425413"}, {"Tasgaon", "Sangli", "416312"},
            {"Thane", "Thane", "400601"}, {"Tuljapur", "Osmanabad", "413601"},
            {"Udgir", "Latur", "413517"}, {"Ulhasnagar", "Thane", "421003"},
            {"Umarga", "Osmanabad", "413606"}, {"Umred", "Nagpur", "441203"},
            {"Uran", "Raigad", "400702"}, {"Umarkhed", "Yavatmal", "445206"},
            {"Vaijapur", "Aurangabad", "423701"}, {"Vasai", "Palghar", "401201"},
            {"Vashi", "Thane", "400703"}, {"Velhe", "Pune", "412212"},
            {"Vengurla", "Sindhudurg", "416516"}, {"Vikramgad", "Palghar", "401605"},
            {"Vita", "Sangli", "415311"}, {"Wadala", "Mumbai", "400031"},
            {"Wadwani", "Beed", "431519"}, {"Wai", "Satara", "412803"},
            {"Wani", "Yavatmal", "445304"}, {"Wardha", "Wardha", "442001"},
            {"Warora", "Chandrapur", "442907"}, {"Washim", "Washim", "444505"},
            {"Yavatmal", "Yavatmal", "445001"}, {"Yeola", "Nashik", "423401"},
            {"Yermala", "Aurangabad", "431120"}
        });
        
        // ========== MANIPUR (16 Districts) ==========
        addDistrictsAndCities(pincodes, "Manipur", new String[][]{
            {"Imphal", "Imphal East", "795001"}, {"Thoubal", "Thoubal", "795138"}, 
            {"Kakching", "Kakching", "795103"}, {"Ukhrul", "Ukhrul", "795142"}, 
            {"Churachandpur", "Churachandpur", "795128"}, {"Bishnupur", "Bishnupur", "795126"}, 
            {"Senapati", "Senapati", "795106"}, {"Tamenglong", "Tamenglong", "795141"},
            {"Jiribam", "Imphal East", "795116"}, {"Moreh", "Tengnoupal", "795131"},
            {"Kangpokpi", "Kangpokpi", "795129"}, {"Kamjong", "Kamjong", "795142"},
            {"Noney", "Noney", "795103"}, {"Pherzawl", "Pherzawl", "795128"},
            {"Tengnoupal", "Tengnoupal", "795131"}
        });
        
        // ========== MEGHALAYA (12 Districts) ==========
        addDistrictsAndCities(pincodes, "Meghalaya", new String[][]{
            {"Shillong", "East Khasi Hills", "793001"}, {"Tura", "West Garo Hills", "794001"}, 
            {"Jowai", "West Jaintia Hills", "793150"}, {"Nongpoh", "Ri Bhoi", "793103"}, 
            {"Williamnagar", "East Garo Hills", "794111"}, {"Baghmara", "South Garo Hills", "794102"}, 
            {"Resubelpara", "North Garo Hills", "794103"}, {"Nongstoin", "West Khasi Hills", "793119"},
            {"Ampati", "South West Garo Hills", "794115"}, {"Khliehriat", "East Jaintia Hills", "793200"},
            {"Mairang", "West Khasi Hills", "793120"}, {"Mawkyrwat", "South West Khasi Hills", "793109"}
        });
        
        // ========== MIZORAM (11 Districts) ==========
        addDistrictsAndCities(pincodes, "Mizoram", new String[][]{
            {"Aizawl", "Aizawl", "796001"}, {"Lunglei", "Lunglei", "796701"}, 
            {"Saiha", "Saiha", "796901"}, {"Champhai", "Champhai", "796321"}, 
            {"Kolasib", "Kolasib", "796081"}, {"Serchhip", "Serchhip", "796181"}, 
            {"Lawngtlai", "Lawngtlai", "796891"}, {"Mamit", "Mamit", "796441"},
            {"Hnahthial", "Hnahthial", "796701"}, {"Khawzawl", "Khawzawl", "796321"},
            {"Saitual", "Saitual", "796261"}
        });
        
        // ========== NAGALAND (16 Districts) ==========
        addDistrictsAndCities(pincodes, "Nagaland", new String[][]{
            {"Kohima", "Kohima", "797001"}, {"Dimapur", "Dimapur", "797112"}, 
            {"Mokokchung", "Mokokchung", "798601"}, {"Tuensang", "Tuensang", "798612"}, 
            {"Wokha", "Wokha", "797111"}, {"Zunheboto", "Zunheboto", "798620"}, 
            {"Mon", "Mon", "798621"}, {"Phek", "Phek", "797108"},
            {"Longleng", "Longleng", "798625"}, {"Peren", "Peren", "797101"},
            {"Kiphire", "Kiphire", "798611"}, {"Noklak", "Noklak", "798621"},
            {"Shamator", "Shamator", "798612"}, {"Tseminyu", "Tseminyu", "797111"}
        });
        
        // ========== ODISHA (30 Districts) ==========
        addDistrictsAndCities(pincodes, "Odisha", new String[][]{
            {"Bhubaneswar", "Khordha", "751001"}, {"Cuttack", "Cuttack", "753001"}, 
            {"Rourkela", "Sundargarh", "769001"}, {"Berhampur", "Ganjam", "760001"}, 
            {"Sambalpur", "Sambalpur", "768001"}, {"Puri", "Puri", "752001"}, 
            {"Baleshwar", "Balasore", "756001"}, {"Baripada", "Mayurbhanj", "757001"}, 
            {"Jharsuguda", "Jharsuguda", "768201"}, {"Rayagada", "Rayagada", "765001"}, 
            {"Balangir", "Balangir", "767001"}, {"Kendujhar", "Keonjhar", "758001"},
            {"Bhadrak", "Bhadrak", "756100"}, {"Jagatsinghpur", "Jagatsinghpur", "754103"},
            {"Kendrapara", "Kendrapara", "754211"}, {"Nayagarh", "Nayagarh", "752069"},
            {"Phulbani", "Kandhamal", "762001"}, {"Dhenkanal", "Dhenkanal", "759001"},
            {"Angul", "Angul", "759122"}, {"Bargarh", "Bargarh", "768028"},
            {"Boudh", "Boudh", "762014"}, {"Deogarh", "Deogarh", "768108"},
            {"Gajapati", "Gajapati", "761207"}, {"Jajpur", "Jajpur", "755007"},
            {"Kalahandi", "Kalahandi", "766001"}, {"Kandhamal", "Kandhamal", "762001"},
            {"Koraput", "Koraput", "764020"}, {"Malkangiri", "Malkangiri", "764045"},
            {"Nuapada", "Nuapada", "766105"}, {"Puri", "Puri", "752001"}
        });
        
        // ========== PUNJAB (23 Districts) ==========
        addDistrictsAndCities(pincodes, "Punjab", new String[][]{
            {"Ludhiana", "Ludhiana", "141001"}, {"Amritsar", "Amritsar", "143001"}, 
            {"Jalandhar", "Jalandhar", "144001"}, {"Patiala", "Patiala", "147001"}, 
            {"Bathinda", "Bathinda", "151001"}, {"Pathankot", "Pathankot", "145001"}, 
            {"Hoshiarpur", "Hoshiarpur", "146001"}, {"Mohali", "SAS Nagar", "160055"}, 
            {"Batala", "Gurdaspur", "143505"}, {"Abohar", "Fazilka", "152116"}, 
            {"Moga", "Moga", "142001"}, {"Firozpur", "Firozpur", "152001"},
            {"Muktsar", "Sri Muktsar Sahib", "152026"}, {"Sangrur", "Sangrur", "148001"},
            {"Barnala", "Barnala", "148101"}, {"Faridkot", "Faridkot", "151203"},
            {"Kapurthala", "Kapurthala", "144601"}, {"Rupnagar", "Rupnagar", "140001"},
            {"Tarn Taran", "Tarn Taran", "143401"}, {"Malerkotla", "Sangrur", "148023"},
            {"Nawanshahr", "Shahid Bhagat Singh Nagar", "144514"}, {"Fatehgarh Sahib", "Fatehgarh Sahib", "140406"}
        });
        
        // ========== RAJASTHAN (50 Districts) ==========
        addDistrictsAndCities(pincodes, "Rajasthan", new String[][]{
            {"Jaipur", "Jaipur", "302001"}, {"Jodhpur", "Jodhpur", "342001"}, 
            {"Kota", "Kota", "324001"}, {"Bikaner", "Bikaner", "334001"}, 
            {"Ajmer", "Ajmer", "305001"}, {"Udaipur", "Udaipur", "313001"}, 
            {"Bhilwara", "Bhilwara", "311001"}, {"Alwar", "Alwar", "301001"}, 
            {"Bharatpur", "Bharatpur", "321001"}, {"Sikar", "Sikar", "332001"}, 
            {"Pali", "Pali", "306401"}, {"Tonk", "Tonk", "304001"},
            {"Jhunjhunu", "Jhunjhunu", "333001"}, {"Churu", "Churu", "331001"},
            {"Banswara", "Banswara", "327001"}, {"Dungarpur", "Dungarpur", "314001"},
            {"Sri Ganganagar", "Sri Ganganagar", "335001"}, {"Hanumangarh", "Hanumangarh", "335513"},
            {"Barmer", "Barmer", "344001"}, {"Jaisalmer", "Jaisalmer", "345001"},
            {"Nagaur", "Nagaur", "341001"}, {"Chittorgarh", "Chittorgarh", "312001"},
            {"Baran", "Baran", "325205"}, {"Bundi", "Bundi", "323001"},
            {"Dausa", "Dausa", "303303"}, {"Dholpur", "Dholpur", "328001"},
            {"Dungarpur", "Dungarpur", "314001"}, {"Jalore", "Jalore", "343001"},
            {"Jhalawar", "Jhalawar", "326001"}, {"Karauli", "Karauli", "322201"},
            {"Pratapgarh", "Pratapgarh", "312605"}, {"Rajsamand", "Rajsamand", "313324"},
            {"Sawai Madhopur", "Sawai Madhopur", "322001"}, {"Sirohi", "Sirohi", "307001"},
            {"Barmer", "Barmer", "344001"}, {"Jaisalmer", "Jaisalmer", "345001"}
        });
        
        // ========== SIKKIM (6 Districts) ==========
        addDistrictsAndCities(pincodes, "Sikkim", new String[][]{
            {"Gangtok", "East Sikkim", "737101"}, {"Namchi", "South Sikkim", "737126"}, 
            {"Mangan", "North Sikkim", "737116"}, {"Gyalshing", "West Sikkim", "737111"}, 
            {"Singtam", "East Sikkim", "737134"}, {"Rangpo", "East Sikkim", "737132"}
        });
        
        // ========== TAMIL NADU (38 Districts) ==========
        addDistrictsAndCities(pincodes, "Tamil Nadu", new String[][]{
            {"Chennai", "Chennai", "600001"}, {"Coimbatore", "Coimbatore", "641001"}, 
            {"Madurai", "Madurai", "625001"}, {"Tiruchirappalli", "Tiruchirappalli", "620001"}, 
            {"Salem", "Salem", "636001"}, {"Tirunelveli", "Tirunelveli", "627001"}, 
            {"Erode", "Erode", "638001"}, {"Vellore", "Vellore", "632001"}, 
            {"Thoothukudi", "Thoothukudi", "628001"}, {"Dindigul", "Dindigul", "624001"}, 
            {"Thanjavur", "Thanjavur", "613001"}, {"Hosur", "Krishnagiri", "635109"},
            {"Tiruppur", "Tiruppur", "641601"}, {"Kanchipuram", "Kanchipuram", "631501"},
            {"Karaikudi", "Sivaganga", "630001"}, {"Nagercoil", "Kanyakumari", "629001"},
            {"Cuddalore", "Cuddalore", "607001"}, {"Sivakasi", "Virudhunagar", "626123"},
            {"Karur", "Karur", "639001"}, {"Pudukkottai", "Pudukkottai", "622001"},
            {"Ariyalur", "Ariyalur", "621704"}, {"Chengalpattu", "Chengalpattu", "603001"},
            {"Kallakurichi", "Kallakurichi", "606201"}, {"Kanchipuram", "Kanchipuram", "631501"},
            {"Kanyakumari", "Kanyakumari", "629702"}, {"Karur", "Karur", "639001"},
            {"Krishnagiri", "Krishnagiri", "635001"}, {"Madurai", "Madurai", "625001"},
            {"Mayiladuthurai", "Mayiladuthurai", "609001"}, {"Nagapattinam", "Nagapattinam", "611001"},
            {"Namakkal", "Namakkal", "637001"}, {"Nilgiris", "Nilgiris", "643001"},
            {"Perambalur", "Perambalur", "621212"}, {"Pudukkottai", "Pudukkottai", "622001"},
            {"Ramanathapuram", "Ramanathapuram", "623501"}, {"Ranipet", "Ranipet", "632401"},
            {"Tenkasi", "Tenkasi", "627811"}, {"Theni", "Theni", "625531"},
            {"Thoothukudi", "Thoothukudi", "628001"}, {"Tiruchirappalli", "Tiruchirappalli", "620001"},
            {"Tirunelveli", "Tirunelveli", "627001"}, {"Tirupathur", "Tirupathur", "635601"},
            {"Tiruppur", "Tiruppur", "641601"}, {"Tiruvallur", "Tiruvallur", "602001"},
            {"Tiruvannamalai", "Tiruvannamalai", "606601"}, {"Tiruvarur", "Tiruvarur", "610001"},
            {"Vellore", "Vellore", "632001"}, {"Viluppuram", "Viluppuram", "605601"},
            {"Virudhunagar", "Virudhunagar", "626001"}
        });
        
        // ========== TELANGANA (33 Districts) ==========
        addDistrictsAndCities(pincodes, "Telangana", new String[][]{
            {"Hyderabad", "Hyderabad", "500001"}, {"Warangal", "Warangal Urban", "506001"}, 
            {"Nizamabad", "Nizamabad", "503001"}, {"Karimnagar", "Karimnagar", "505001"}, 
            {"Ramagundam", "Peddapalli", "505208"}, {"Khammam", "Khammam", "507001"}, 
            {"Mahbubnagar", "Mahabubnagar", "509001"}, {"Nalgonda", "Nalgonda", "508001"}, 
            {"Adilabad", "Adilabad", "504001"}, {"Siddipet", "Siddipet", "502103"}, 
            {"Sangareddy", "Sangareddy", "502001"}, {"Mancherial", "Mancherial", "504208"},
            {"Jagitial", "Jagitial", "505327"}, {"Kamareddy", "Kamareddy", "503111"},
            {"Medak", "Medak", "502110"}, {"Nirmal", "Nirmal", "504106"},
            {"Bhadradri Kothagudem", "Bhadradri Kothagudem", "507101"}, {"Jangaon", "Jangaon", "506167"},
            {"Jayashankar Bhupalpally", "Jayashankar Bhupalpally", "506342"}, {"Jogulamba Gadwal", "Jogulamba Gadwal", "509125"},
            {"Komaram Bheem", "Komaram Bheem", "504292"}, {"Mahabubabad", "Mahabubabad", "506101"},
            {"Mulugu", "Mulugu", "506343"}, {"Narayanpet", "Narayanpet", "509210"},
            {"Narayanpet", "Narayanpet", "509210"}, {"Rajanna Sircilla", "Rajanna Sircilla", "505301"},
            {"Sangareddy", "Sangareddy", "502001"}, {"Suryapet", "Suryapet", "508213"},
            {"Vikarabad", "Vikarabad", "501101"}, {"Wanaparthy", "Wanaparthy", "509103"},
            {"Yadadri Bhuvanagiri", "Yadadri Bhuvanagiri", "508116"}
        });
        
        // ========== TRIPURA (8 Districts) ==========
        addDistrictsAndCities(pincodes, "Tripura", new String[][]{
            {"Agartala", "West Tripura", "799001"}, {"Udaipur", "Gomati", "799114"}, 
            {"Dharmanagar", "North Tripura", "799250"}, {"Kailasahar", "Unakoti", "799277"}, 
            {"Belonia", "South Tripura", "799155"}, {"Khowai", "Khowai", "799201"}, 
            {"Ambassa", "Dhalai", "799289"}, {"Sabroom", "South Tripura", "799144"}
        });
        
        // ========== UTTAR PRADESH (75 Districts) ==========
        addDistrictsAndCities(pincodes, "Uttar Pradesh", new String[][]{
            {"Lucknow", "Lucknow", "226001"}, {"Kanpur", "Kanpur Nagar", "208001"}, 
            {"Agra", "Agra", "282001"}, {"Varanasi", "Varanasi", "221001"}, 
            {"Meerut", "Meerut", "250001"}, {"Allahabad", "Prayagraj", "211001"}, 
            {"Bareilly", "Bareilly", "243001"}, {"Aligarh", "Aligarh", "202001"}, 
            {"Moradabad", "Moradabad", "244001"}, {"Saharanpur", "Saharanpur", "247001"}, 
            {"Gorakhpur", "Gorakhpur", "273001"}, {"Faizabad", "Ayodhya", "224001"}, 
            {"Jhansi", "Jhansi", "284001"}, {"Muzaffarnagar", "Muzaffarnagar", "251001"}, 
            {"Mathura", "Mathura", "281001"}, {"Firozabad", "Firozabad", "283203"}, 
            {"Rampur", "Rampur", "244901"}, {"Shahjahanpur", "Shahjahanpur", "242001"}, 
            {"Etawah", "Etawah", "206001"}, {"Sitapur", "Sitapur", "261001"}, 
            {"Budaun", "Budaun", "243601"}, {"Ghaziabad", "Ghaziabad", "201001"},
            {"Noida", "Gautam Buddha Nagar", "201301"}, {"Bulandshahr", "Bulandshahr", "203001"},
            {"Hapur", "Hapur", "245101"}, {"Bijnor", "Bijnor", "246701"},
            {"Amroha", "Amroha", "244221"}, {"Azamgarh", "Azamgarh", "276001"},
            {"Bahraich", "Bahraich", "271801"}, {"Ballia", "Ballia", "277001"},
            {"Banda", "Banda", "210001"}, {"Barabanki", "Barabanki", "225001"},
            {"Basti", "Basti", "272001"}, {"Bhadohi", "Bhadohi", "221401"},
            {"Bijnor", "Bijnor", "246701"}, {"Bulandshahr", "Bulandshahr", "203001"},
            {"Chandauli", "Chandauli", "232101"}, {"Chitrakoot", "Chitrakoot", "210204"},
            {"Deoria", "Deoria", "274001"}, {"Etah", "Etah", "207001"},
            {"Farrukhabad", "Farrukhabad", "209625"}, {"Fatehpur", "Fatehpur", "212601"},
            {"Ghazipur", "Ghazipur", "233001"}, {"Gonda", "Gonda", "271001"},
            {"Hamirpur", "Hamirpur", "210301"}, {"Hardoi", "Hardoi", "241001"},
            {"Hathras", "Hathras", "204101"}, {"Jalaun", "Jalaun", "285001"},
            {"Jaunpur", "Jaunpur", "222001"}, {"Kannauj", "Kannauj", "209725"},
            {"Kasganj", "Kasganj", "207123"}, {"Kaushambi", "Kaushambi", "212201"},
            {"Kheri", "Kheri", "262701"}, {"Kushinagar", "Kushinagar", "274403"},
            {"Lalitpur", "Lalitpur", "284403"}, {"Maharajganj", "Maharajganj", "273303"},
            {"Mahoba", "Mahoba", "210427"}, {"Mainpuri", "Mainpuri", "205001"},
            {"Mau", "Mau", "275101"}, {"Mirzapur", "Mirzapur", "231001"},
            {"Pilibhit", "Pilibhit", "262001"}, {"Pratapgarh", "Pratapgarh", "230001"},
            {"Raebareli", "Raebareli", "229001"}, {"Rampur", "Rampur", "244901"},
            {"Sambhal", "Sambhal", "244302"}, {"Sant Kabir Nagar", "Sant Kabir Nagar", "272175"},
            {"Shahjahanpur", "Shahjahanpur", "242001"}, {"Shamli", "Shamli", "247776"},
            {"Shravasti", "Shravasti", "271841"}, {"Siddharthnagar", "Siddharthnagar", "272153"},
            {"Sonbhadra", "Sonbhadra", "231216"}, {"Sultanpur", "Sultanpur", "228001"},
            {"Unnao", "Unnao", "209801"}
        });
        
        // ========== UTTARAKHAND (13 Districts) ==========
        addDistrictsAndCities(pincodes, "Uttarakhand", new String[][]{
            {"Dehradun", "Dehradun", "248001"}, {"Haridwar", "Haridwar", "249401"}, 
            {"Roorkee", "Haridwar", "247667"}, {"Haldwani", "Nainital", "263139"}, 
            {"Rudrapur", "Udham Singh Nagar", "263153"}, {"Kashipur", "Udham Singh Nagar", "244713"}, 
            {"Rishikesh", "Dehradun", "249201"}, {"Pithoragarh", "Pithoragarh", "262501"}, 
            {"Nainital", "Nainital", "263001"}, {"Mussoorie", "Dehradun", "248179"}, 
            {"Almora", "Almora", "263601"}, {"Pauri", "Pauri Garhwal", "246001"},
            {"Chamoli", "Chamoli", "246401"}, {"Tehri", "Tehri Garhwal", "249001"},
            {"Bageshwar", "Bageshwar", "263642"}, {"Champawat", "Champawat", "262523"},
            {"Udham Singh Nagar", "Udham Singh Nagar", "263153"}
        });
        
        // ========== WEST BENGAL (23 Districts) ==========
        addDistrictsAndCities(pincodes, "West Bengal", new String[][]{
            {"Kolkata", "Kolkata", "700001"}, {"Howrah", "Howrah", "711101"}, 
            {"Durgapur", "Paschim Bardhaman", "713216"}, {"Asansol", "Paschim Bardhaman", "713301"}, 
            {"Siliguri", "Darjeeling", "734001"}, {"Bardhaman", "Purba Bardhaman", "713101"}, 
            {"Malda", "Malda", "732101"}, {"Kharagpur", "Paschim Medinipur", "721301"}, 
            {"Baharampur", "Murshidabad", "742101"}, {"Habra", "North 24 Parganas", "743263"}, 
            {"Krishnanagar", "Nadia", "741101"}, {"Jalpaiguri", "Jalpaiguri", "735101"}, 
            {"Raiganj", "Uttar Dinajpur", "733134"}, {"Cooch Behar", "Cooch Behar", "736101"}, 
            {"Alipurduar", "Alipurduar", "736121"}, {"Balurghat", "Dakshin Dinajpur", "733101"},
            {"Bankura", "Bankura", "722101"}, {"Purulia", "Purulia", "723101"},
            {"Medinipur", "Paschim Medinipur", "721101"}, {"Barasat", "North 24 Parganas", "700124"},
            {"Basirhat", "North 24 Parganas", "743412"}, {"Birbhum", "Birbhum", "731101"},
            {"Hooghly", "Hooghly", "712101"}
        });
        
        // ========== UNION TERRITORIES ==========
        addDistrictsAndCities(pincodes, "Andaman and Nicobar Islands", new String[][]{
            {"Port Blair", "South Andaman", "744101"}, {"Diglipur", "North Andaman", "744202"}, 
            {"Mayabunder", "North Andaman", "744103"}, {"Rangat", "Middle Andaman", "744203"}, 
            {"Car Nicobar", "Nicobar", "744301"}
        });
        
        addDistrictsAndCities(pincodes, "Chandigarh", new String[][]{
            {"Chandigarh", "Chandigarh", "160017"}
        });
        
        addDistrictsAndCities(pincodes, "Dadra and Nagar Haveli and Daman and Diu", new String[][]{
            {"Daman", "Daman", "396210"}, {"Diu", "Diu", "362520"}, {"Silvassa", "Dadra and Nagar Haveli", "396230"}
        });
        
        addDistrictsAndCities(pincodes, "Delhi", new String[][]{
            {"New Delhi", "New Delhi", "110001"}, {"Delhi", "Central Delhi", "110006"}, 
            {"North Delhi", "North Delhi", "110009"}, {"South Delhi", "South Delhi", "110017"}, 
            {"East Delhi", "East Delhi", "110092"}, {"West Delhi", "West Delhi", "110018"},
            {"North East Delhi", "North East Delhi", "110053"}, {"North West Delhi", "North West Delhi", "110085"},
            {"Shahdara", "Shahdara", "110032"}, {"South East Delhi", "South East Delhi", "110017"},
            {"South West Delhi", "South West Delhi", "110075"}
        });
        
        addDistrictsAndCities(pincodes, "Jammu and Kashmir", new String[][]{
            {"Srinagar", "Srinagar", "190001"}, {"Jammu", "Jammu", "180001"}, 
            {"Anantnag", "Anantnag", "192101"}, {"Baramulla", "Baramulla", "193101"}, 
            {"Sopore", "Baramulla", "193201"}, {"Kathua", "Kathua", "184101"}, 
            {"Udhampur", "Udhampur", "182101"}, {"Rajouri", "Rajouri", "185131"},
            {"Pulwama", "Pulwama", "192301"}, {"Kupwara", "Kupwara", "193222"},
            {"Bandipora", "Bandipora", "193502"}, {"Ganderbal", "Ganderbal", "191201"},
            {"Kulgam", "Kulgam", "192231"}, {"Poonch", "Poonch", "185101"},
            {"Ramban", "Ramban", "182144"}, {"Reasi", "Reasi", "182311"},
            {"Samba", "Samba", "184121"}, {"Shopian", "Shopian", "192303"}
        });
        
        addDistrictsAndCities(pincodes, "Ladakh", new String[][]{
            {"Leh", "Leh", "194101"}, {"Kargil", "Kargil", "194103"}
        });
        
        addDistrictsAndCities(pincodes, "Lakshadweep", new String[][]{
            {"Kavaratti", "Lakshadweep", "682555"}, {"Agatti", "Lakshadweep", "682553"}, 
            {"Amini", "Lakshadweep", "682552"}, {"Andrott", "Lakshadweep", "682551"}, 
            {"Kadmat", "Lakshadweep", "682557"}
        });
        
        addDistrictsAndCities(pincodes, "Puducherry", new String[][]{
            {"Puducherry", "Puducherry", "605001"}, {"Karaikal", "Karaikal", "609602"}, 
            {"Mahe", "Mahe", "673310"}, {"Yanam", "Yanam", "533464"}
        });
        
        pincodeService.saveAllPincodes(pincodes);
        System.out.println("Loaded " + pincodes.size() + " comprehensive pincode records with valid districts for all Indian states");
    }
    
    private void addDistrictsAndCities(List<Pincode> pincodes, String state, String[][] cityDistrictPincodeTriplets) {
        for (String[] triplet : cityDistrictPincodeTriplets) {
            String city = triplet[0];
            String district = triplet[1];
            String pincode = triplet[2];
            pincodes.add(createPincode(pincode, state, district, city, district, district, getRegion(state)));
        }
    }
    
    private String getRegion(String state) {
        // Categorize states by region
        if (state.equals("Maharashtra") || state.equals("Gujarat") || state.equals("Goa")) {
            return "West";
        } else if (state.equals("Karnataka") || state.equals("Kerala") || state.equals("Tamil Nadu") || 
                   state.equals("Andhra Pradesh") || state.equals("Telangana")) {
            return "South";
        } else if (state.equals("Uttar Pradesh") || state.equals("Bihar") || state.equals("Jharkhand") ||
                   state.equals("West Bengal") || state.equals("Odisha")) {
            return "East";
        } else if (state.equals("Rajasthan") || state.equals("Haryana") || state.equals("Punjab") ||
                   state.equals("Himachal Pradesh") || state.equals("Uttarakhand") || 
                   state.equals("Delhi") || state.equals("Chandigarh")) {
            return "North";
        } else if (state.equals("Madhya Pradesh") || state.equals("Chhattisgarh")) {
            return "Central";
        } else {
            return "Northeast";
        }
    }
    
    private Pincode createPincode(String pincode, String state, String district, String city, 
                                  String taluka, String division, String region) {
        Pincode p = new Pincode();
        p.setPincode(pincode);
        p.setState(state);
        p.setDistrict(district);
        p.setCity(city);
        p.setTaluka(taluka);
        p.setDivision(division);
        p.setRegion(region);
        return p;
    }
}
