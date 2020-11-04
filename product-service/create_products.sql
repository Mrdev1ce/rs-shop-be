create table products (
	id uuid primary key not null default uuid_generate_v4(),
	title text not null,
	description text,
	price int
);

create table stocks (
	product_id uuid primary key not null,
	count int not null,
	foreign key (product_id) references products (id)
);

insert into products (id,title,description,price) values
	 ('ae7bc7f9-84d7-482a-a898-a99ff9f989c7','RS Backpack','Backpack with logo of RS School',100),
	 ('33e14cac-3f52-45f9-9896-28dd6c8955b0','Phone Case','Phone Case with logo of RS School',10),
	 ('c4e2b306-1778-4125-9145-f647eb27403f','T-shirt','T-shirt with logo of RS School',18),
	 ('58a24349-ad5f-4ca7-89db-196ce4894450','Hoodie','Hoodie with logo of RS School',30),
	 ('fcbeea01-3d5b-418f-9148-d262ece20358','Pen','Pen with logo of RS School',2),
	 ('6254c7ba-10c3-40a6-93c3-6577f169c7f1','Notebook','Notebook with logo of RS School',5),
	 ('ad3fe97d-a054-40fe-8c5d-363d3c54c801','Bracelet','Bracelet with logo of RS School',2),
	 ('d88d0bf4-c158-4dc3-9652-623a55470be2','Rs School History Book','Book telling the history of company',40);

insert into stocks (product_id, count) values
	('ae7bc7f9-84d7-482a-a898-a99ff9f989c7', 10),
	('33e14cac-3f52-45f9-9896-28dd6c8955b0', 131),
	('c4e2b306-1778-4125-9145-f647eb27403f', 22),
	('58a24349-ad5f-4ca7-89db-196ce4894450', 44),
	('fcbeea01-3d5b-418f-9148-d262ece20358', 275),
	('6254c7ba-10c3-40a6-93c3-6577f169c7f1', 65),
	('ad3fe97d-a054-40fe-8c5d-363d3c54c801', 15),
	('d88d0bf4-c158-4dc3-9652-623a55470be2', 13);
	
--with ins_products as (
--	insert into products (title, description, price)
--	values
--	('RS Backpack', 'Backpack with logo of RS School', 100),
--	('Phone Case', 'Phone Case with logo of RS School', 10),
--	('T-shirt', 'T-shirt with logo of RS School', 18),
--	('Hoodie', 'Hoodie with logo of RS School', 30),
--	('Pen', 'Pen with logo of RS School', 2),
--	('Notebook', 'Notebook with logo of RS School', 5),
--	('Bracelet', 'Bracelet with logo of RS School', 2),
--	('Rs School History Book', 'Book telling the history of company', 40)
--	returning id as product_id
--)
--insert into stocks (product_id, count)
--values ((select product_id from ins_products), 10);
