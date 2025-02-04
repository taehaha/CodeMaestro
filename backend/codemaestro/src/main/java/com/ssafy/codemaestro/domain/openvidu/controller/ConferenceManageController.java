package com.ssafy.codemaestro.domain.openvidu.controller;

import com.ssafy.codemaestro.domain.openvidu.service.OpenViduService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/conference/manage")
public class ConferenceManageController {
    OpenViduService openViduService;

    @Autowired
    public ConferenceManageController(OpenViduService openViduService) {
        this.openViduService = openViduService;
    }
}
