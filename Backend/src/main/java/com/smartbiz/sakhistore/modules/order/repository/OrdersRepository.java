package com.smartbiz.sakhistore.modules.order.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartbiz.sakhistore.modules.order.model.Orders;
import com.smartbiz.sakhistore.modules.customer_user.model.User;



@Repository
public interface OrdersRepository extends JpaRepository<Orders, Long> {

    List<Orders> findByUser(User user);


}

