package com.softql.apicem.security;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.softql.apicem.domain.User;

public class SecurityUtil {

	public static User currentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null) {
			return null;
		}

		if (auth instanceof AnonymousAuthenticationToken) {
			return null;
		}

		return (User) auth.getPrincipal();
	}
}
