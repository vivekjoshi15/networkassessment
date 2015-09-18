package com.softql.apicem.api.user;

import com.google.gson.Gson;
import com.softql.apicem.Constants;
import com.softql.apicem.domain.User;
import com.softql.apicem.exception.SearchException;
import com.softql.apicem.model.DiscoveryExcelFiles;
import com.softql.apicem.model.PasswordForm;
import com.softql.apicem.model.ProfileForm;
import com.softql.apicem.model.SignupForm;
import com.softql.apicem.model.logDetail;
import com.softql.apicem.model.UserDetails;
import com.softql.apicem.security.CurrentUser;
import com.softql.apicem.service.UserService;
import com.softql.apicem.service.EmailService;

import java.lang.Object;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.logging.Level;
import java.util.*;
import javax.mail.*;
import javax.mail.internet.*;
import javax.servlet.http.HttpServletRequest;
import javax.activation.*;

import javax.inject.Inject;
import javax.validation.Valid;

import org.apache.commons.lang3.StringUtils;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = Constants.URI_API + Constants.URI_SELF)
public class CurrentUserController {

    private static final Logger log = LoggerFactory
            .getLogger(CurrentUserController.class);
    
    @Inject
    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    @Inject
    private UserService userService;
    
    @Inject
	private MongoOperations mongoTemplate;

    @RequestMapping(value = "", method = RequestMethod.GET)
    @ResponseBody
    public UserDetails currentUser(@CurrentUser User user) {
        if (log.isDebugEnabled()) {
            log.debug("get current user info");
        }

        UserDetails details = userService.findUserById(user.getId());

        if (log.isDebugEnabled()) {
            log.debug("current user value @" + details);
        }

        return details;
    }

    @RequestMapping(value = "", method = RequestMethod.PUT, params = "aciton=CHANGE_PWD")
    @ResponseBody
    public ResponseEntity<Void> changePassword(
            @CurrentUser User user,
            @RequestBody PasswordForm fm) {
        if (log.isDebugEnabled()) {
            log.debug("change password of user@" + fm);
        }

        userService.updatePassword(user.getId(), fm);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "", method = RequestMethod.PUT, params = "action=UPDATE_PROFILE")
    @ResponseBody
    public ResponseEntity<Void> updateProfile(
            @CurrentUser User user,
            @RequestBody ProfileForm fm) {
        if (log.isDebugEnabled()) {
            log.debug("update user profile data @" + fm);
        }

        userService.updateProfile(user.getId(), fm);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    @RequestMapping(value = "/forgetPassword", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<String> forgotPassword(@RequestBody UserDetails form) {
        if (log.isDebugEnabled()) {
            log.debug("get current user info");
        }
        
        Query findUserQuery = new Query();
		findUserQuery.addCriteria(Criteria.where("email").is(form.getEmail()));
		UserDetails User = mongoTemplate.findOne(findUserQuery, UserDetails.class, "apicUser");
		
        if(User==null)
        {
			return new ResponseEntity<>("invalid email", HttpStatus.BAD_REQUEST);
        }   
        else
        {
        	mongoTemplate.save(User, "apicUser");
        	
        	//Sending Email to User
	        EmailService emailSrv=new EmailService();
	        String subject="Forget User Password";
	        String emailBody=" "+ User.getUsername()+",\n\n Your password: "+ User.getPassword() +"\n\n Thanks";
	        
	        String response=emailSrv.sendEmail(subject, emailBody, form.getEmail());
	        if(response=="Error Sending Email")
	        {
	        	return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
	        }    
        }
		return new ResponseEntity<>("An Email sent with password", HttpStatus.CREATED);
    }
    
    @RequestMapping(value = "/login", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<String> loginUser(@RequestBody UserDetails form) {
        if (log.isDebugEnabled()) {
            log.debug("get current user info");
        }
        
        Query findUserQuery = new Query();
		findUserQuery.addCriteria(Criteria.where("username").is(form.getUsername()).and("password").is(form.getPassword()));
		UserDetails User = mongoTemplate.findOne(findUserQuery, UserDetails.class, "apicUser");
        if(User==null)
        {
			return new ResponseEntity<>("invalid username or password", HttpStatus.BAD_REQUEST);
        }        
        Gson gson = new Gson();
        String json = gson.toJson(User);
        
		return new ResponseEntity<>(json, HttpStatus.CREATED);
    }
    
    @RequestMapping(value = "/signup", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<String> signupUser(@RequestBody UserDetails form) {
        if (log.isDebugEnabled()) {
            log.debug("get current user info");
        }
        
        Query findUserQuery = new Query();
		findUserQuery.addCriteria(Criteria.where("email").is(form.getEmail()));
		UserDetails oldUser = mongoTemplate.findOne(findUserQuery, UserDetails.class, "apicUser");
        if(oldUser!=null)
        {
			return new ResponseEntity<>("useremail already exists", HttpStatus.BAD_REQUEST);
        }
        else
        {
        	findUserQuery = new Query();
			findUserQuery.addCriteria(Criteria.where("username").is(form.getUsername()));
			oldUser = mongoTemplate.findOne(findUserQuery, UserDetails.class, "apicUser");
	        if(oldUser!=null)
	        {
				return new ResponseEntity<>("username already exists", HttpStatus.BAD_REQUEST);
	        }
	        else
	        {
		        if(form.getId()==null)
		        {
			        ObjectId id = new ObjectId();
			        form.setId((long) id.getTimestamp());
		        }
		        Date now = new Date();
		        form.setCreatedDate(now);

		        form.setPassword(form.getPassword());
		        //Query query = new Query(); 
		        mongoTemplate.save(form, "apicUser"); 
		        
		       //Sending Email to Admin
		        EmailService emailSrv=new EmailService();
		        String subject="New User Signup";
		        String emailBody=" Admin, \n\n New user signup for APIC-EM Network Assement Application \n\n Below are the login details:\n\n Username: "+ form.getUsername() +"\n Email Address: "+form.getEmail() +"\n\n Thanks";
		        
		        String response=emailSrv.sendEmail(subject, emailBody, "Vivek@softql.com");
		        if(response=="Error Sending Email")
		        {
		        	return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		        }
		        
		        //Sending Welcome Email to User
		        subject="New User Signup";
		        emailBody=" Welcome User, \n\n You are signup for APIC-EM Network Assement Application \n Your login details are:\n\n Username: "+ form.getUsername() +"\n Email Address: "+form.getEmail() +"\n Password: "+form.getPassword() +"\n\n Thanks";
		        
		        response=emailSrv.sendEmail(subject, emailBody, form.getEmail());
		        if(response=="Error Sending Email")
		        {
		        	return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		        }
	        }
        }
		return new ResponseEntity<>("Success "+form.toString(), HttpStatus.CREATED);
    }
    
    @RequestMapping(value={"/getUser"}, method={RequestMethod.GET})
    @ResponseBody
    public ResponseEntity<String> getUser(@RequestParam(value="id", required=true) Long id , HttpServletRequest request) {
    	Query findUserQuery = new Query();
    	if(id != null && id != 0){
	    	findUserQuery.addCriteria(Criteria.where("id").is(id));
			UserDetails User = mongoTemplate.findOne(findUserQuery, UserDetails.class, "apicUser");	
	        
	        Gson gson = new Gson();
	        String json = gson.toJson(User);
	        return new ResponseEntity(json, HttpStatus.OK);
    	}
    	else
    	{
			return new ResponseEntity<>("invalid user", HttpStatus.BAD_REQUEST);
    	}
    }
    
    @RequestMapping(value = "/updateuser", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<String> updateUser(@RequestBody UserDetails form) {
        if (log.isDebugEnabled()) {
            log.debug("get current user info");
        }
        
        Query findUserQuery = new Query();
		findUserQuery.addCriteria(Criteria.where("id").is(form.getId()));
		UserDetails User = mongoTemplate.findOne(findUserQuery, UserDetails.class, "apicUser");
        if(User==null)
        {
			return new ResponseEntity<>("invalid user", HttpStatus.BAD_REQUEST);
        }
        else
        { 
        		form.setCreatedDate(User.getCreatedDate());
		        //Query query = new Query(); 
		        mongoTemplate.save(form, "apicUser"); 	
        }
		return new ResponseEntity<>("Success "+form.toString(), HttpStatus.CREATED);
    }
    
    @RequestMapping(value = "/logs", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<Void> getLogs(@RequestBody logDetail form, @CurrentUser User usr){
    	 if (log.isDebugEnabled()) {
             log.debug(Level.FINE +"get current user info");
         }    	
    	
    	 Date now = new Date();
    	 logDetail logd = new logDetail();
    	 
    	 logd.setcreatedDate(now);
    	 logd.setUserId(form.getUserId());
    	 logd.setMessage(form.getMessage());
    	 logd.setType(form.getType());    	 
    	
    	 mongoTemplate.save(logd, "logging");  

         if (log.isDebugEnabled()) {
             log.debug("current user value @" + form);
         }
         
         return new ResponseEntity<>(HttpStatus.CREATED);
    }

}
