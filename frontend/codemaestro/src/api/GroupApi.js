import UserAxios from "./userAxios";

    // 랭킹 그룹 가져오기
    // 더미데이터 아직 사용중임.
    export const getGroupList = async () => {
        try {
            const response = await UserAxios.get('/groups',{
                params:{
                    sort:"rank",
                    limit:10,
                    friends:false
                }
            })
    
            return response.data
        } catch (error) {
            console.error("랭킹 불러오는 중 오류 발생", error);
            return [{groupId:"12",name:"더미랭킹그룹1", groupImage:'/test_profile.png', groupRanking:1, points:9999},
                {groupId:"13",name:"더미랭킹그룹2", groupImage:'/test_profile.png', groupRanking:2, points:9998},
                {groupId:"14",name:"더미랭킹그룹1", groupImage:'/test_profile.png', groupRanking:1, points:9999},
                {groupId:"15",name:"더미랭킹그룹2", groupImage:'/test_profile.png', groupRanking:2, points:9998},
                {groupId:"16",name:"더미랭킹그룹1", groupImage:'/test_profile.png', groupRanking:1, points:9999},
                {groupId:"17",name:"더미랭킹그룹2", groupImage:'/test_profile.png', groupRanking:2, points:9998},
            ]
        }
    }

    export const getMyGroupList = async () => {
        try {
            const response = await UserAxios.get(`/groups`, {
                // params: { friends: true }
            });
    
            return response.data;
        } catch (error) {
            console.error("내 그룹 불러오는 중 오류 발생", error);
            return [
                { groupId: 1, name: "SSAFY 13기", members: 5, groupRanking: 2, points: 9998 },
                { groupId: 2, name: "코테준비 스터디", members: 4, groupRanking: 2, points: 9998 },
                { groupId: 3, name: "A형 대비 그룹", members: 2, groupRanking: 2, points: 9998 }
            ];
        }
    };
    