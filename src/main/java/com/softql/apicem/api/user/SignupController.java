/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.softql.apicem.api.user;

import java.util.List;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.net.InetAddress;
import java.net.UnknownHostException;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.validator.routines.InetAddressValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.softql.apicem.Constants;
import com.softql.apicem.exception.InvalidRequestException;
import com.softql.apicem.model.ApicEmLoginForm;
import com.softql.apicem.model.SignupForm;
import com.softql.apicem.model.UserDetails;
import com.softql.apicem.security.SecurityUtil;
import com.softql.apicem.service.ApicEmService;
import com.softql.apicem.service.UserService;
import com.softql.apicem.util.ServiceURLS;
import com.softql.apicem.util.URLUtil;

/**
 *
 * @author Ramesh
 */
@RequestMapping(value = Constants.URI_API)
@RestController
public class SignupController {

	private static final Logger log = LoggerFactory.getLogger(SignupController.class);

	@Inject
	private UserService userService;

	@Inject
	private AuthenticationManager authenticationManager;

	@Inject
	private ApicEmService apicEmService;

	@RequestMapping(value = { "/signup" }, method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<Void> signup(@RequestBody @Valid SignupForm form, BindingResult errors, HttpServletRequest req) {
		if (log.isDebugEnabled()) {
			log.debug("signup data@" + form);
		}

		if (errors.hasErrors()) {
			throw new InvalidRequestException(errors);
		}

		UserDetails saved = userService.registerUser(form);

		HttpHeaders headers = new HttpHeaders();
		headers.setLocation(ServletUriComponentsBuilder.fromContextPath(req)
				.path(Constants.URI_API_PUBLIC + Constants.URI_USERS + "/{id}").buildAndExpand(saved.getId()).toUri());

		return new ResponseEntity<>(headers, HttpStatus.CREATED);
	}

	@RequestMapping(value = { "/token" }, method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<String> getToken(@RequestBody ApicEmLoginForm form, BindingResult errors,
			HttpServletRequest req) {
		if (log.isDebugEnabled()) {
			log.debug("signup data@" + form);
		}

		if (errors.hasErrors()) {
			throw new InvalidRequestException(errors);
		}

		String url = URLUtil
				.constructUrl(form.getApicemIP(), null, form.getVersion(), ServiceURLS.TICKET.value(), null);
		String token = "";
		boolean hasErrors = false;
		try {
			token = apicEmService.getToken(form, url);
		} catch (Exception e) {
			hasErrors = true;
			e.printStackTrace();
		}

		if (StringUtils.isBlank(token) || hasErrors) {
			if (!StringUtils.equalsIgnoreCase(form.getApicemIP(), "sandboxapic.cisco.com")
					&& !StringUtils.equalsIgnoreCase(form.getApicemIP(), "64.103.26.55")) {
				return new ResponseEntity<>(token, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}

		return new ResponseEntity<>(token, HttpStatus.CREATED);
	}

	@RequestMapping(value = { "/apicem" }, method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<String> onboardApicEm(@RequestBody ApicEmLoginForm form, BindingResult errors,
			HttpServletRequest req) {

		if (errors.hasErrors()) {
			throw new InvalidRequestException(errors);
		}

		if(StringUtils.equalsIgnoreCase(form.getApicemType(), "dns"))
        {
        	try {
	        	InetAddress inetAddress = InetAddress.getByName(form.getApicemIP());
	        	if (inetAddress==null) {
					return new ResponseEntity<>("Invalid DNS address", HttpStatus.BAD_REQUEST);
				}
	        	else
	        	{
	        		String userName = SecurityUtil.currentUser().getUsername();
					form.setUserId(userName);
					form.setVersion(form.getVersion().toLowerCase());
					apicEmService.onBoardApicem(form);
	        	}
        	} catch (UnknownHostException e) {
        		return new ResponseEntity<>("Invalid DNS address", HttpStatus.BAD_REQUEST);
    		}
        }
        else
        {
			if (InetAddressValidator.getInstance().isValidInet4Address(form.getApicemIP())) {
				String userName = SecurityUtil.currentUser().getUsername();
				form.setUserId(userName);
				form.setVersion(form.getVersion().toLowerCase());
				apicEmService.onBoardApicem(form);
			} else {
				return new ResponseEntity<>("Invalid IP address", HttpStatus.BAD_REQUEST);
			}
        }

		return new ResponseEntity<>("Success", HttpStatus.CREATED);
	}

	@RequestMapping(value = { "/apicem/{id}" }, method = RequestMethod.PUT)
	@ResponseBody
	public ResponseEntity<String> updateOnbaordEpicEM(@RequestBody ApicEmLoginForm form, @PathVariable("id") String id) {
		if(StringUtils.equalsIgnoreCase(form.getApicemType(), "DNS"))
        {
			try {
	        	InetAddress inetAddress = InetAddress.getByName(form.getApicemIP());
	        	if (inetAddress==null) {
					return new ResponseEntity<>("Invalid DNS address", HttpStatus.BAD_REQUEST);
				}
	        	else
	        	{
	        		String userName = SecurityUtil.currentUser().getUsername();
					form.setUserId(userName);
					form.setVersion(form.getVersion().toLowerCase());
					form.setId(id);
					apicEmService.updateApicEM(form);
	        	}
        	} catch (UnknownHostException e) {
        		return new ResponseEntity<>("Invalid DNS address", HttpStatus.BAD_REQUEST);
    		}
        }
		else
		{
			if (InetAddressValidator.getInstance().isValidInet4Address(form.getApicemIP())) {
				String userName = SecurityUtil.currentUser().getUsername();
				form.setUserId(userName);
				form.setVersion(form.getVersion().toLowerCase());
				form.setId(id);
				apicEmService.updateApicEM(form);
			} else {
				return new ResponseEntity<>("Invalid IP address", HttpStatus.BAD_REQUEST);
			}
		}

		return new ResponseEntity<>("Success", HttpStatus.CREATED);
	}

	@RequestMapping(value = { "/apicem/{id}" }, method = RequestMethod.DELETE)
	@ResponseBody
	public ResponseEntity<String> deleteApicEM(@PathVariable("id") String id) {
		try {
			apicEmService.deleteApicEM(id);
		} catch (Exception e) {
			return new ResponseEntity<>("Delete has some issue", HttpStatus.FORBIDDEN);
		}
		return new ResponseEntity<>("Success", HttpStatus.OK);
	}

	@RequestMapping(value = { "/apicem/validate" }, method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<String> validateApicEM(@RequestBody ApicEmLoginForm form, BindingResult errors,
			HttpServletRequest req) {
		
        if(StringUtils.equalsIgnoreCase(form.getApicemType(), "dns"))
        {
        	try {
	        	InetAddress inetAddress = InetAddress.getByName(form.getApicemIP());
	        	if (inetAddress==null) {
					return new ResponseEntity<>("Invalid DNS address", HttpStatus.BAD_REQUEST);
				}
        	} catch (UnknownHostException e) {
        		return new ResponseEntity<>("Invalid DNS address", HttpStatus.BAD_REQUEST);
    		}
        }
        else
        {
			if (!InetAddressValidator.getInstance().isValidInet4Address(form.getApicemIP())) {
				return new ResponseEntity<>("Invalid IP address", HttpStatus.BAD_REQUEST);
			}
        }

		return new ResponseEntity<>("Success", HttpStatus.OK);
	}

	@RequestMapping(value = { "/apicem" }, method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<List<ApicEmLoginForm>> getAllApicEMs(HttpServletRequest req) {

		String userName = SecurityUtil.currentUser().getUsername();
		List<ApicEmLoginForm> apicEMList = apicEmService.getApicEms(userName);

		return new ResponseEntity<>(apicEMList, HttpStatus.OK);
	}
}
