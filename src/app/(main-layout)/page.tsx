import { Users } from "lucide-react";

// 샘플 팀 데이터
const teams = [
  {
    id: 1,
    name: "FC 서울",
    description: "매주 토요일 오후 2시, 강남구 축구장",
    memberCount: 12,
    city: "서울시",
    district: "강남구",
    isJoined: true,
    gender: "male",
    isRecruiting: true,
    logo: "⚽",
    totalMatches: 24,
  },
  {
    id: 2,
    name: "한강 FC",
    description: "일요일 아침 풋살, 초보자 환영",
    memberCount: 8,
    city: "서울시",
    district: "마포구",
    isJoined: false,
    gender: "male",
    isRecruiting: false,
    logo: "🔥",
    totalMatches: 18,
  },
  {
    id: 3,
    name: "강북 유나이티드",
    description: "주말 저녁 경기, 실력자들만",
    memberCount: 16,
    city: "서울시",
    district: "강북구",
    isJoined: false,
    gender: "male",
    isRecruiting: true,
    logo: "🏆",
    totalMatches: 32,
  },
  {
    id: 4,
    name: "서울 위민스 FC",
    description: "여성 축구팀, 매주 일요일 모임",
    memberCount: 10,
    city: "서울시",
    district: "영등포구",
    isJoined: false,
    gender: "female",
    isRecruiting: false,
    logo: "💜",
    totalMatches: 15,
  },
  {
    id: 5,
    name: "강남 레이디스",
    description: "강남 지역 여성 풋살팀",
    memberCount: 14,
    city: "서울시",
    district: "강남구",
    isJoined: false,
    gender: "female",
    isRecruiting: true,
    logo: "🌟",
    totalMatches: 28,
  },
  {
    id: 6,
    name: "수원 FC",
    description: "경기도 수원 지역 남성팀",
    memberCount: 20,
    city: "경기도",
    district: "수원시",
    isJoined: false,
    gender: "male",
    isRecruiting: true,
    logo: "⭐",
    totalMatches: 42,
  },
];

const MainPage = () => {
  // 내 팀과 다른 팀 분리
  const myTeams = teams.filter((team) => team.isJoined);
  const otherTeams = teams.filter((team) => !team.isJoined);

  return (
    <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-2xl">
      <div className="p-4 space-y-4">
        {/* 내 팀 섹션 */}
        {myTeams.length > 0 && (
          <div className="space-y-3">
            {myTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}

        {/* 다른 팀 섹션 */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            {myTeams.length > 0 ? "다른 팀" : "전체 팀"}
          </h2>
          <div className="space-y-3">
            {otherTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </div>

        {/* 팀이 없는 경우 */}
        {teams.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              팀이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">새 팀을 만들어보세요</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 팀 카드 컴포넌트
type Team = {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  city: string;
  district: string;
  isJoined: boolean;
  gender: string;
  isRecruiting: boolean;
  logo: string;
  totalMatches: number;
};

type TeamCardProps = {
  team: Team;
};

const TeamCard = ({ team }: TeamCardProps) => {
  return (
    <div className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* 팀 로고 */}
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
          {team.logo}
        </div>

        {/* 팀 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">{team.name}</h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                team.gender === "male"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-pink-100 text-pink-800"
              }`}
            >
              {team.gender === "male" ? "남성팀" : "여성팀"}
            </span>
            {team.isRecruiting && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex-shrink-0">
                모집중
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">
            {team.description}
          </p>
        </div>

        {/* 누적 경기수와 멤버 수 */}
        <div className="text-center flex-shrink-0 flex items-center gap-2">
          <div className="w-12">
            <div className="text-xs text-gray-500 mb-1">경기</div>
            <div className="text-lg font-semibold text-gray-900">
              {team.totalMatches}
            </div>
          </div>
          <span className="text-gray-300">|</span>
          <div className="w-12">
            <div className="text-xs text-gray-500 mb-1">멤버</div>
            <div className="text-lg font-semibold text-gray-900">
              {team.memberCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// // 더보기 콘텐츠 컴포넌트
// const MoreContent = ({ items }) => {
//   return (
//     <div className="p-4">
//       <div className="space-y-1">
//         {items.map((item) => {
//           const Icon = item.icon;
//           return (
//             <button
//               key={item.id}
//               className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
//             >
//               <Icon className="w-5 h-5 mr-3 text-gray-500" />
//               <span className="text-gray-900">{item.label}</span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

export default MainPage;
