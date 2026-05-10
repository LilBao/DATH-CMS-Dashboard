# Cinema Management System - DTO Documentation

This document contains all Data Transfer Objects (DTOs) used for API Requests and Responses in the Cinema Management System backend.

## API Request DTOs

### BranchRequest
```java
package com.cms.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchRequest {

    @NotBlank(message = "Branch name is required")
    @Size(max = 100)
    private String bName;

    @NotBlank(message = "Branch address is required")
    @Size(max = 200)
    private String bAddress;

    /** Employee ID of the manager */
    private String managerId;

    private List<String> phoneNumbers;
}
```

### ChangePasswordRequest
```java
package com.cms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {
    @NotBlank(message = "Old password is required")
    private String oldPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "New password must be at least 6 characters")
    private String newPassword;
}
```

### CouponRequest
```java
package com.cms.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer saleOff;
    private Integer releaseNum;
    private Integer availNum;
    @Builder.Default
    private Boolean isActive = true;
}
```

### EmployeeRequest
```java
package com.cms.dto.request;

import com.cms.common.enums.UserType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequest {

    @NotBlank(message = "Employee ID is required")
    @Size(max = 20)
    private String eUserId;

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String eName;

    private String sex;

    @Size(max = 15)
    private String phoneNumber;

    @Email
    @Size(max = 100)
    private String email;

    /** Plain-text password - will be encoded in service */
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String ePassword;

    @NotNull(message = "Salary is required")
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal salary;

    @NotNull(message = "User type is required")
    private UserType userType;

    @NotNull(message = "Branch ID is required")
    private Integer branchId;

    private String managerId;
}
```

### FoodDrinkRequest
```java
package com.cms.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodDrinkRequest {

    @NotBlank(message = "Product type is required")
    @Size(max = 50)
    private String pType;

    @NotBlank(message = "Product name is required")
    @Size(max = 255)
    private String pName;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @Min(value = 0)
    private Integer quantity;

    private String imgUrl;
}
```

### MerchandiseRequest
```java
package com.cms.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchandiseRequest {
    private String merchName;
    private BigDecimal price;
    private Integer availNum;
    private LocalDate startDate;
    private LocalDate endDate;
    private String imgUrl;
}
```

### MovieRequest
```java
package com.cms.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieRequest {

    @NotBlank(message = "Movie name is required")
    @Size(max = 255)
    private String mName;

    private String descript;

    @NotNull(message = "Runtime is required")
    @Min(value = 1, message = "Runtime must be at least 1 minute")
    private Integer runTime;

    @Builder.Default
    private Boolean isDub = false;

    @Builder.Default
    private Boolean isSub = true;

    @NotNull(message = "Release date is required")
    private LocalDate releaseDate;

    @NotNull(message = "Closing date is required")
    private LocalDate closingDate;

    @NotBlank(message = "Age rating is required")
    @Pattern(regexp = "^(K|T13|T16|T18)$", message = "Age rating must be K, T13, T16, or T18")
    private String ageRating;

    private String posterUrl;
    private String trailerUrl;

    private Set<String> genreIds;
    private Set<String> formatIds;
    private Set<String> actorIds;
}
```

### OrderRequest
```java
package com.cms.dto.request;

import lombok.Data;
import java.util.List;
import java.math.BigDecimal;

@Data
public class OrderRequest {
    private String paymentMethod;
    private Integer couponId;
    
    private List<TicketRequest> tickets;
    private List<AddonItemRequest> addons;
    
    @Data
    public static class TicketRequest {
        private Integer showtimeId;
        private Integer branchId;
        private Integer roomId;
        private Integer sRow;
        private Integer sColumn;
        private BigDecimal tPrice;
    }
    
    @Data
    public static class AddonItemRequest {
        private Integer productId;
        private String pType;
        private String pName;
        private Integer quantity;
        private BigDecimal price; // Price per item
    }
}
```

### ReviewRequest
```java
package com.cms.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    @NotNull(message = "Movie ID is required")
    private Integer movieId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 10, message = "Rating must be at most 10")
    private Integer rating;

    @NotBlank(message = "Comment cannot be empty")
    private String comment;
}
```

### ScreenRoomRequest
```java
package com.cms.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenRoomRequest {

    @NotNull(message = "Branch ID is required")
    private Integer branchId;

    @NotNull(message = "Room ID is required")
    private Integer roomId;

    @NotBlank(message = "Room type is required")
    @Size(max = 30)
    private String rType;

    @NotNull(message = "Capacity is required")
    @Min(value = 1)
    private Integer rCapacity;

    private BigDecimal basePrice;
}
```

### SeatRequest
```java
package com.cms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatRequest {
    @NotNull(message = "Branch ID is required")
    private Integer branchId;

    @NotNull(message = "Room ID is required")
    private Integer roomId;

    @NotNull(message = "Row is required")
    private Integer sRow;

    @NotNull(message = "Column is required")
    private Integer sColumn;

    private Integer sType;
    private BigDecimal sPrice;
    private Boolean sStatus;
}
```

### ShowtimeRequest
```java
package com.cms.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeRequest {

    @NotNull(message = "Movie ID is required")
    private Integer movieId;

    @NotNull(message = "Branch ID is required")
    private Integer branchId;

    @NotNull(message = "Room ID is required")
    private Integer roomId;

    private String formatName;

    @NotNull(message = "Day is required")
    private LocalDate day;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;
}
```

### UpdateProfileRequest
```java
package com.cms.dto.request;

import com.cms.enums.ESex;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    @NotBlank(message = "Tên không được để trống")
    private String name;
    
    private ESex sex;
    
    private LocalDate birthday;
    
    private String phoneNumber;
    
    private String avatarUrl;
}
```

---

## API Response DTOs

### AddonResponse
```java
package com.cms.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AddonResponse {
    private Integer productId;
    private String pName;
    private Integer quantity;
    private BigDecimal price;
    private String itemType;
}
```

### BranchResponse
```java
package com.cms.dto.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchResponse {
    private Integer branchId;
    private String bName;
    private String bAddress;
    private String managerName;
    private String managerId;
    private List<String> phoneNumbers;
    private Integer totalRooms;
}
```

### BranchRevenueResponse
```java
package com.cms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchRevenueResponse {
    private Integer branchId;
    private String branchName;
    private BigDecimal revenue;
    private Long ticketCount;
}
```

### CouponResponse
```java
package com.cms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponse {
    private Integer couponId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer saleOff;
    private Integer releaseNum;
    private Integer availNum;
    private Boolean isActive;
}
```

### CustomerResponse
```java
package com.cms.dto.response;

import com.cms.common.enums.UserType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private String cUserId;
    private String cName;
    private String sex;
    private String phoneNumber;
    private String email;
    private UserType userType;
    private String authProvider;
    private String avatarUrl;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Membership info
    private String membershipTier;
    private Integer totalPoints;
}
```

### DailyRevenueResponse
```java
package com.cms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyRevenueResponse {
    private LocalDate date;
    private BigDecimal revenue;
    private Long ticketCount;
}
```

### EmployeeResponse
```java
package com.cms.dto.response;

import com.cms.common.enums.UserType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private String eUserId;
    private String eName;
    private String sex;
    private String phoneNumber;
    private String email;
    private BigDecimal salary;
    private UserType userType;
    private boolean isActive;
    private Integer branchId;
    private String branchName;
    private String managerId;
    private String managerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### FoodDrinkResponse
```java
package com.cms.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodDrinkResponse {
    private Integer productId;
    private String pType;
    private String pName;
    private BigDecimal price;
    private Integer quantity;
    private String itemType;
    private String imgUrl;
}
```

### MerchandiseResponse
```java
package com.cms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchandiseResponse {
    private Integer productId;
    private String merchName;
    private BigDecimal price;
    private Integer availNum;
    private LocalDate startDate;
    private LocalDate endDate;
    private String imgUrl;
}
```

### MovieResponse
```java
package com.cms.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieResponse {
    private Integer movieId;
    private String mName;
    private String descript;
    private Integer runTime;
    private Boolean isDub;
    private Boolean isSub;
    private String slug;
    private LocalDate releaseDate;
    private LocalDate closingDate;
    private String ageRating;
    private String posterUrl;
    private String trailerUrl;
    private Set<String> genres;
    private Set<String> formats;
    private Set<String> actors;
    private Double avgRating;
    private Integer reviewCount;
}
```

### MovieRevenueResponse
```java
package com.cms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieRevenueResponse {
    private Integer movieId;
    private String movieName;
    private BigDecimal revenue;
    private Long ticketCount;
}
```

### OccupancyResponse
```java
package com.cms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyResponse {
    private Integer showtimeId;
    private String movieName;
    private String branchName;
    private Integer roomId;
    private LocalDate day;
    private LocalTime startTime;
    private Integer capacity;
    private Integer ticketsSold;
    private Double occupancyRate;

    public OccupancyResponse(Integer showtimeId, String movieName, String branchName, Integer roomId, 
                             LocalDate day, LocalTime startTime, Integer capacity, int ticketsSold) {
        this.showtimeId = showtimeId;
        this.movieName = movieName;
        this.branchName = branchName;
        this.roomId = roomId;
        this.day = day;
        this.startTime = startTime;
        this.capacity = capacity;
        this.ticketsSold = ticketsSold;
        this.occupancyRate = 0.0;
    }
}
```

### OrderResponse
```java
package com.cms.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Integer orderId;
    private LocalDateTime orderTime;
    private String paymentMethod;
    private BigDecimal originalTotal;
    private BigDecimal discountAmount;
    private BigDecimal total;
    private String orderStatus;
    private String paymentUrl;
    private List<TicketResponse> ticketDetails;
    private List<AddonResponse> addonDetails;
}
```

### ReviewResponse
```java
package com.cms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private String customerName;
    private String customerAvatar;
    private Integer rating;
    private String comment;
    private LocalDate reviewDate;
}
```

### ScreenRoomResponse
```java
package com.cms.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenRoomResponse {
    private Integer branchId;
    private Integer roomId;
    private String rType;
    private Integer rCapacity;
    private BigDecimal basePrice;
    private Integer totalSeats;
}
```

### SeatResponse
```java
package com.cms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatResponse {
    private Integer branchId;
    private Integer roomId;
    private Integer sRow;
    private Integer sColumn;
    private Integer sType;
    private BigDecimal sPrice;
    private Boolean sStatus;
    private Boolean isBooked;
}
```

### ShowtimeResponse
```java
package com.cms.dto.response;

import com.cms.enums.ERType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeResponse {
    private Integer timeId;
    private Integer movieId;
    private String movieName;
    private Integer branchId;
    private String branchName;
    private Integer roomId;
    private ERType rType;
    private BigDecimal rPrice;
    private String formatName;
    private LocalDate day;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
}
```

### TicketResponse
```java
package com.cms.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TicketResponse {
    private Integer ticketId;
    private String movieName;
    private String screenRoomName;
    private String branchName;
    private String seatName;
    private LocalDateTime showtime;
    private BigDecimal price;
}
```
