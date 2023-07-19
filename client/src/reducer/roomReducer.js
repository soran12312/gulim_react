// 초기 상태(Initial State)
const initialState = {
    user: [] // 유저 정보를 담을 배열
  };
  
  // 액션 타입(Action Types)
  const ADD_USER = 'ADD_USER';
  const REMOVE_USER = 'REMOVE_USER';
  
  // 액션 생성자(Action Creators)
  export const addUser = (roomId, peerId, userId, streamId) => {
    return {
      type: ADD_USER,
      payload: {
        roomId,
        peerId,
        userId,
        streamId
      }
    };
  };

  export const removeUser = (peerId) => {
    return {
      type: REMOVE_USER,
      payload: peerId
    };
  };
  
  // 리듀서(Reducer)
  const roomReducer = (state = initialState, action) => {
    switch (action.type) {
      case ADD_USER:
      const newUser = action.payload;
      const existingUser = state.user.find(user => user.userId === newUser.userId);

      if (existingUser) {
        // 기존 유저 정보 수정
        const updatedUsers = state.user.map(user => {
          if (user.userId === newUser.userId) {
            return {
              ...user,
              // 필요한 속성을 수정하거나 추가
              roomId: newUser.roomId,
              peerId: newUser.peerId,
              streamId: newUser.streamId
            };
          }
          return user;
        });

        return {
          ...state,
          user: updatedUsers
        };
      } else {
        // 새로운 유저 정보 추가
        return {
          ...state,
          user: [...state.user, newUser]
        };
      }
      case REMOVE_USER:
        const userIdToRemove = action.payload;
        const updatedUsers = state.user.filter(data => data.peerId !== userIdToRemove);
        return {
          ...state,
          user: updatedUsers
        };
      default:
        return state;
    }
  };

  export default roomReducer;