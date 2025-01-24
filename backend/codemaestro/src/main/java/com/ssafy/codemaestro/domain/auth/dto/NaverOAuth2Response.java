package com.ssafy.codemaestro.domain.auth.dto;

import java.util.Iterator;
import java.util.Map;

public class NaverOAuth2Response implements OAuth2Response {
    private final Map<String, Object> attribute;

    /*
    oAuth2User = Name: [{id=NktDvCVBziVn_2wjtYJo1X3oAzZDYT9_lLQadkOIG04, profile_image=https://ssl.pstatic.net/static/pwe/address/img_profile.png, name=김태영}], Granted Authorities: [[OAUTH2_USER]], User Attributes: [{resultcode=00, message=success, response={id=NktDvCVBziVn_2wjtYJo1X3oAzZDYT9_lLQadkOIG04, profile_image=https://ssl.pstatic.net/static/pwe/address/img_profile.png, name=김태영}}]
    키 : id, 값 : NktDvCVBziVn_2wjtYJo1X3oAzZDYT9_lLQadkOIG04
    키 : profile_image, 값 : https://ssl.pstatic.net/static/pwe/address/img_profile.png
    키 : name, 값 : 김태영
     */

    public NaverOAuth2Response(Map<String, Object> attribute) {
        this.attribute = (Map<String, Object>) attribute.get("response");
    }

    @Override
    public String getProvider() {
        Iterator<String> keys = attribute.keySet().iterator();
        while (keys.hasNext()){
            String key = keys.next();
            String value = (String) attribute.get(key);
            System.out.println("키 : "+key+", 값 : "+value);
        }

        return "naver";
    }

    @Override
    public String getProviderId() {
        return attribute.get("id").toString();
    }

    @Override
    public String getName() {
        return attribute.get("name").toString();
    }

    @Override
    public String getProfileImageUrl() {
        String profileImageUrl = (String) attribute.get("profile_image");
        if (profileImageUrl == null) {
            return null;
        } else {
            return profileImageUrl;
        }
    }


}
