import {Api} from '@psyrenpark/api';

var projectName = 'wsp'; // 각 프로젝트 단축명
var projectEnv = 'prod'; // 각 프로젝트 환경 // dev, test, prod

var v1Api = `${projectName}-${projectEnv}-api-v1`;
var v1Cdn = `${projectName}-${projectEnv}-cdn-v1`;

export const IMAGE_URL = 'https://file.whospick.com/public/';

export const apiObject = {
  //!------------------------------------------
  //! 인증 있는 api

  // 회원 기본 정보 입력
  applyUserInfo: ({name, mobile_no, birth_dt, referral_code, career_list, image_list}, loading) => {
    var apiName = v1Api;
    var path = '/director/my-privacy';
    var myInit = {
      body: {
        langCode: 'ko',
        name,
        mobile_no,
        birth_dt,
        referral_code,
        career_list,
        image_list,
      },
      // queryStringParameters: {
      // },
      // response: true,  // axios 원형 response 필요할 경우 ture로 설정한다.
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 로그인 후 회원 기본 정보 가져오기
  getUserInfo: loading => {
    var apiName = v1Api;
    var path = '/director/my-info';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 공지사항 가져오기
  getNoticeList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/director/notice-list';
    var myInit = {
      queryStringParameters: {
        next_token: next_token,
      },
      // response: true,  // axios 원형 response 필요할 경우 ture로 설정한다.
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 알림 가져오기
  getNotificationList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/director/notify-list';
    var myInit = {
      queryStringParameters: {
        next_token: next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 알림 읽기
  confirmNotification: ({notify_no}, loading) => {
    var apiName = v1Api;
    var path = '/director/confirm/notify';
    var myInit = {
      body: {
        notify_no,
      },
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 이미지 업로드
  imageUpload: ({url}, loading) => {
    var apiName = v1Api;
    var path = '/director/image';
    var myInit = {
      body: {
        url,
      },
      // response: true,  // axios 원형 response 필요할 경우 ture로 설정한다.
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 파일 업로드
  fileUpload: ({url}, loading) => {
    var apiName = v1Api;
    var path = '/director/file';
    var myInit = {
      body: {
        url,
      },
      // response: true,  // axios 원형 response 필요할 경우 ture로 설정한다.
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 회원정보 수정
  editUserInfo: ({name, mobile_no, profile_image_no}, loading) => {
    var apiName = v1Api;
    var path = '/director/my-privacy';
    var myInit = {
      body: {
        name,
        mobile_no,
        profile_image_no,
      },
      // response: true,  // axios 원형 response 필요할 경우 ture로 설정한다.
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 감독용 <==> 배우용 타입 추가
  addUserType: loading => {
    var apiName = v1Api;
    var path = '/director/signup';
    var myInit = {};
    return Api.post(apiName, path, myInit, loading);
  },

  // FAQ 목록 가져오기
  getFAQList: ({faq_category_no, search_text}, loading) => {
    var apiName = v1Api;
    var path = `/director/faq-list/${faq_category_no}`;
    var myInit = {
      queryStringParameters: {
        search_text,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 제휴업체 리스트 가져오기
  getPartnerList: ({affiliate_category_no, next_token, search_text}, loading) => {
    var apiName = v1Api;
    var path = `/director/affiliate-list/${affiliate_category_no}`;
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 제휴업체 상세 가져오기
  getPartnerDetail: ({affiliate_no}, loading) => {
    var apiName = v1Api;
    var path = `/director/affiliate/${affiliate_no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 제휴업체 댓글/대댓글 등록하기
  addPartnerComment: ({affiliate_no, affiliate_comment_no, content}, loading) => {
    var apiName = v1Api;
    var path = `/director/affiliate/${affiliate_no}/comment`;
    var myInit = {
      body: {
        affiliate_comment_no,
        content,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 내 1:1 고객 문의 가져오기
  getMyQnAList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/director/my-qna-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 1:1 문의 작성하기
  addMyQnA: ({title, content}, loading) => {
    var apiName = v1Api;
    var path = '/director/qna';
    var myInit = {
      body: {
        title,
        content,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 찜 배우 리스트 가져오기
  getLikeActorList: ({next_token, gender}, loading) => {
    var apiName = v1Api;
    var path = '/director/dibs-actor-list';
    var myInit = {
      queryStringParameters: {
        next_token,
        gender,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 배우 디테일 정보 가져오기
  getActorInfo: ({actor_no}, loading) => {
    var apiName = v1Api;
    var path = `/director/actor/${actor_no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 추천 배우 가져오기
  getRecommendActorList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/director/recommend-actor-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 인기 배우 가져오기
  getPopularActorList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/director/popular-actor-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 실시간 배우 가져오기
  getRealTimeActorList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/director/realtime-actor-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 이달의 배우 가져오기
  getActorOfMonthList: loading => {
    var apiName = v1Api;
    var path = '/director/actor-of-month';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 평가 요청 배우 가져오기
  getReviewActorList: ({next_token}, loading) => {
    var apiName = v1Api;
    var path = '/director/eval-apply-list';
    var myInit = {
      queryStringParameters: {
        next_token,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 배우 평가하기
  reviewActorProfile: ({eval_apply_no, star, eval_feedback_type_no, direct_input}, loading) => {
    var apiName = v1Api;
    var path = `/director/eval-profile/${eval_apply_no}`;
    var myInit = {
      body: {
        star,
        eval_feedback_type_no,
        direct_input,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 배우 평가 조회하기
  getReviewActorProfile: ({eval_apply_no}, loading) => {
    var apiName = v1Api;
    var path = `/director/eval-profile/${eval_apply_no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션 등록하기
  applyAuditionInfo: (
    {
      work_type_no,
      work_type_detail_no,
      work_title,
      company,
      director_name,
      manager,
      shoot_start,
      shoot_end,
      shoot_place,
      fee,
      male_count,
      female_count,
      deadline,
      title,
      content,
      genre_no_list,
      image_no_list,
      recruit_list,
    },
    loading
  ) => {
    var apiName = v1Api;
    var path = '/director/audition';
    var myInit = {
      body: {
        work_type_no,
        work_type_detail_no,
        work_title,
        company,
        director_name,
        manager,
        shoot_start,
        shoot_end,
        shoot_place,
        fee,
        male_count,
        female_count,
        deadline,
        title,
        content,
        genre_no_list,
        image_no_list,
        recruit_list,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 오디션 수정하기
  editAuditionInfo: (
    {
      work_type_no,
      work_type_detail_no,
      work_title,
      company,
      director_name,
      manager,
      shoot_start,
      shoot_end,
      shoot_place,
      fee,
      male_count,
      female_count,
      deadline,
      title,
      content,
      genre_no_list,
      image_no_list,
      recruit_list,
      audition_no,
    },
    loading
  ) => {
    var apiName = v1Api;
    var path = `/director/audition/${audition_no}`;
    var myInit = {
      body: {
        work_type_no,
        work_type_detail_no,
        work_title,
        company,
        director_name,
        manager,
        shoot_start,
        shoot_end,
        shoot_place,
        fee,
        male_count,
        female_count,
        deadline,
        title,
        content,
        genre_no_list,
        image_no_list,
        recruit_list,
      },
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 오디션 조회하기
  getAuditionInfo: ({audition_no}, loading) => {
    var apiName = v1Api;
    var path = `/director/audition/${audition_no}`;
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션 마감하기
  closeAudition: ({audition_no}, loading) => {
    var apiName = v1Api;
    var path = `/director/close-audition/${audition_no}`;
    var myInit = {};
    return Api.put(apiName, path, myInit, loading);
  },

  // 오디션 보관하기
  saveAudition: ({audition_no}, loading) => {
    var apiName = v1Api;
    var path = `/director/archive-audition/${audition_no}`;
    var myInit = {};
    return Api.put(apiName, path, myInit, loading);
  },

  // 오디션 삭제하기
  deleteAudition: ({audition_no}, loading) => {
    var apiName = v1Api;
    var path = `/director/audition/${audition_no}`;
    var myInit = {};
    return Api.del(apiName, path, myInit, loading);
  },

  // 오디션 공지사항 상태변경
  changeNoticeStatus: ({audition_no, public_yn}, loading) => {
    var apiName = v1Api;
    var path = `/director/audition/${audition_no}/notice-all/public`;
    var myInit = {
      body: {
        public_yn,
      },
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 오디션 공지사항 등록하기
  applyAuditionNotice: ({audition_no, title, content, audition_notice_level, file_no}, loading) => {
    var apiName = v1Api;
    var path = '/director/audition/notice';
    var myInit = {
      body: {
        audition_no,
        title,
        content,
        audition_notice_level,
        file_no,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 오디션 공지사항 수정하기
  editAuditionNotice: ({audition_notice_no, title, content, audition_notice_level, file_no}, loading) => {
    var apiName = v1Api;
    var path = `/director/audition/notice/${audition_notice_no}`;
    var myInit = {
      body: {
        title,
        content,
        audition_notice_level,
        file_no,
      },
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 오디션 공지사항 삭제하기
  deleteAuditionNotice: ({audition_notice_no, audition_no}, loading) => {
    var apiName = v1Api;
    var path = `/director/audition/notice/${audition_notice_no}`;
    var myInit = {
      body: {
        audition_no,
      },
    };
    return Api.del(apiName, path, myInit, loading);
  },

  // 지원자/합격자 목록
  getAuditionApplicantList: ({audition_no, pass_type_no}, loading) => {
    var apiName = v1Api;
    var path = `/director/audition-apply-list/${audition_no}`;
    var myInit = {
      queryStringParameters: {
        pass_type_no,
      },
    };
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션 합격/불합격 시키기
  changePassStatus: ({audition_apply_no, pass_yn}, loading) => {
    var apiName = v1Api;
    var path = `/director/pass-audition-apply/${audition_apply_no}`;
    var myInit = {
      body: {
        pass_yn,
      },
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 배우 찜 하기
  addFavorite: ({actor_no}, loading) => {
    var apiName = v1Api;
    var path = `/director/dibs-actor/${actor_no}`;
    var myInit = {};
    return Api.post(apiName, path, myInit, loading);
  },

  // 배우 찜 해제
  deleteFavorite: ({actor_no}, loading) => {
    var apiName = v1Api;
    var path = '/director/undibs-actor/';
    var myInit = {
      body: {
        actor_no: [actor_no],
      },
    };
    return Api.put(apiName, path, myInit, loading);
  },

  // 오디션 요청하기 (개인)
  askAudition: ({actor_no}, loading) => {
    var apiName = v1Api;
    var path = '/director/audition-ask';
    var myInit = {
      body: {
        actor_no,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 오디션 요청하기 (전체)
  askAuditionAll: loading => {
    var apiName = v1Api;
    var path = '/director/audition-ask/all-dibs';
    var myInit = {};
    return Api.post(apiName, path, myInit, loading);
  },

  // 필터 적용 배우 검색
  searchActor: (
    {next_token, search_text, gender, age_start, age_end, height_start, height_end, detail_info_list},
    loading
  ) => {
    var apiName = v1Api;
    var path = '/director/search/actor';
    var myInit = {
      body: {
        next_token,
        search_text,
        gender,
        age_start,
        age_end,
        height_start,
        height_end,
        detail_info_list,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 파트너 검색
  searchPartner: (
    {next_token, search_text, gender, age_start, age_end, height_start, height_end, detail_info_list},
    loading
  ) => {
    var apiName = v1Api;
    var path = '/director/search/affiliate';
    var myInit = {
      body: {
        next_token,
        search_text,
        gender,
        age_start,
        age_end,
        height_start,
        height_end,
        detail_info_list,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 오디션 검색
  searchAudition: (
    {next_token, search_text, gender, age_start, age_end, height_start, height_end, detail_info_list},
    loading
  ) => {
    var apiName = v1Api;
    var path = '/director/search/audition';
    var myInit = {
      body: {
        next_token,
        search_text,
        gender,
        age_start,
        age_end,
        height_start,
        height_end,
        detail_info_list,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 필터 적용 통합 검색
  searchAll: ({search_text, gender, age_start, age_end, height_start, height_end, detail_info_list}, loading) => {
    var apiName = v1Api;
    var path = '/director/search/all';
    var myInit = {
      body: {
        search_text,
        gender,
        age_start,
        age_end,
        height_start,
        height_end,
        detail_info_list,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 회원탈퇴
  deleteUser: loading => {
    var apiName = v1Api;
    var path = '/director/me';
    var myInit = {};
    return Api.del(apiName, path, myInit, loading);
  },

  // FCM 토큰 등록
  applyPushToken: ({token_value}, loading) => {
    var apiName = v1Api;
    var path = '/director/push_token';
    var myInit = {
      body: {
        token_value,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  // 홈 탭
  getTabOneList: loading => {
    var apiName = v1Api;
    var path = '/director/main-page';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션공고 탭
  getMyAuditionList: loading => {
    var apiName = v1Api;
    var path = '/director/my-audition-list/all';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 에러 로그
  logging: ({error, desc}, loading) => {
    var apiName = v1Api;
    var path = '/director/log';
    var myInit = {
      body: {
        error,
        desc,
      },
    };
    return Api.post(apiName, path, myInit, loading);
  },

  //!------------------------------------------
  //! 인증 없는 api

  // 유저수 가져오기
  getUserCount: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/user-count'; // test_test_test는 무조건 테스트 api로써 반드시 작동한다.
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // FAQ 카테고리 목록
  getFAQCate: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/faq-types'; // test_test_test는 무조건 테스트 api로써 반드시 작동한다.
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 제휴업체 카테고리 목록
  getPartnerCate: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/affiliate-categories';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 피드백 카테고리 목록
  getFeedBackCate: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/feedback-types';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션 등록 기본 정보
  getAuditionTypeConfig: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/work-types';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 오디션 공지사항 카테고리 목록
  getAuditionNoticeCate: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/audition-notice-level-list';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 배우 필터 카테고리 목록
  getActorConfigCate: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/actor-custom-list';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 이용약관
  getTOS: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/terms-of-service';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },

  // 개인정보처리방침
  getPP: loading => {
    var apiName = v1Cdn;
    var path = '/cdn/privacy-policy';
    var myInit = {};
    return Api.get(apiName, path, myInit, loading);
  },
};
