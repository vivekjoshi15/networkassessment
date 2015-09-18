package com.softql.apicem.config;

import com.softql.apicem.repository.UserRepository;
import com.softql.apicem.security.SimpleUserDetailsServiceImpl;

import javax.inject.Inject;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	@Inject
	private UserRepository userRepository;	

	@Override
	public void configure(WebSecurity web) throws Exception {
		web
            .ignoring()
			.antMatchers("/**/*.html", //
                         "/css/**", //
                         "/js/**", //
                         "/i18n/**",// 
                         "/libs/**",//
                         "/img/**", //
                         "/webjars/**",//
                         "/ico/**");
	}

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
		    .authorizeRequests()
                .antMatchers("/api/public/**")
                .permitAll()
            .and()    
                .authorizeRequests()   
    			.antMatchers("/api/mgt/**")
    			.hasRole("ADMIN")
            .and()    
                .authorizeRequests()   
    			.antMatchers("/api/**")
    			.authenticated()
    		.and()
    			.authorizeRequests()   
    			.anyRequest()
    			.permitAll()
            .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
            .and()
                .httpBasic()
            .and()
                .csrf()
                .disable();
	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth)
			throws Exception {
		auth
			.userDetailsService(new SimpleUserDetailsServiceImpl(userRepository))
			.passwordEncoder(passwordEncoder());
	}


	@Bean
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}

	@Bean
	@Override
	public UserDetailsService userDetailsServiceBean() throws Exception {
		return super.userDetailsServiceBean();
	}

	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
		return passwordEncoder;
	}

}
