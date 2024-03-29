package com.shop24h.error;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.http.*;
import org.springframework.web.bind.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.*;
import org.springframework.web.servlet.mvc.method.annotation.*;

@ControllerAdvice
public class CustomGlobalExceptionHandler extends ResponseEntityExceptionHandler {

	// error handle for @Valid
	@Override
	protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
			HttpHeaders headers, HttpStatus status, WebRequest request) {
		
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("timestamp", new Date());
		body.put("status", status.value());
		// Get all errors
		List<String> errors = ex.getBindingResult().getFieldErrors().stream()
				.map(x -> x.getDefaultMessage()).collect(Collectors.toList());
		body.put("errors", errors);

		return new ResponseEntity<>(body, headers, status);
	}
	
	
    // @ExceptionHandler(Exception.class)
    // public ResponseEntity<Object> handle(Exception ex, 
    //             HttpServletRequest request, HttpServletResponse response) {
    //     if (ex instanceof NullPointerException) {
    //         return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    //     }
    //     return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    // }

}

