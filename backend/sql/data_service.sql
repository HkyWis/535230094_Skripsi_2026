-- POST 
CREATE OR REPLACE FUNCTION public.create_data_service(
    p_customer jsonb,
    p_service  jsonb,
    p_keluhan  jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_customer customer;
    v_service  service;
    v_keluhan  keluhan;
BEGIN
    INSERT INTO customer (customer_id, customer_name, no_telepon)
    SELECT customer_id, customer_name, no_telepon
    FROM jsonb_populate_record(NULL::customer, p_customer)
    RETURNING * INTO v_customer;

    INSERT INTO service (
        service_id, user_id, customer_id, laptop_id, jenis_service_id,
        nomor_tiket_service, tanggal_masuk, laptop_sn, status_garansi,
        status_service, solusi, kategori_kerusakan, harga,
        estimasi_hari, tanggal_selesai
    )
    SELECT
        service_id, user_id, customer_id, laptop_id, jenis_service_id,
        nomor_tiket_service, tanggal_masuk, laptop_sn, status_garansi,
        status_service, solusi, kategori_kerusakan, harga,
        estimasi_hari, tanggal_selesai
    FROM jsonb_populate_record(NULL::service, p_service)
    RETURNING * INTO v_service;

    INSERT INTO keluhan (
        keluhan_id, service_id, keluhan, jumlah_keluhan,
        keluhan_lcd, keluhan_keyboard, keluhan_charger, keluhan_baterai,
        keluhan_engsel, keluhan_motherboard, keluhan_storage, keluhan_memory,
        keluhan_booting, keluhan_kipas, keluhan_port, keluhan_software_os,
        keluhan_password, keluhan_touchpad, keluhan_speaker, keluhan_part,
        keluhan_kamera, keluhan_power
    )
    SELECT
        keluhan_id, service_id, keluhan, jumlah_keluhan,
        keluhan_lcd, keluhan_keyboard, keluhan_charger, keluhan_baterai,
        keluhan_engsel, keluhan_motherboard, keluhan_storage, keluhan_memory,
        keluhan_booting, keluhan_kipas, keluhan_port, keluhan_software_os,
        keluhan_password, keluhan_touchpad, keluhan_speaker, keluhan_part,
        keluhan_kamera, keluhan_power
    FROM jsonb_populate_record(NULL::keluhan, p_keluhan)
    RETURNING * INTO v_keluhan;

    RETURN jsonb_build_object(
        'customer', to_jsonb(v_customer),
        'service',  to_jsonb(v_service),
        'keluhan',  to_jsonb(v_keluhan)
    );
END;
$$;

NOTIFY pgrst, 'reload schema';

SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'create_data_service';

-- Update
CREATE OR REPLACE FUNCTION public.update_data_service(
    p_service_id varchar,
    p_customer   jsonb,
    p_service    jsonb,
    p_keluhan    jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_customer_id varchar;
    v_customer    customer;
    v_service     service;
    v_keluhan     keluhan;
BEGIN
    SELECT customer_id INTO v_customer_id
    FROM service
    WHERE service_id = p_service_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service tidak ditemukan' USING ERRCODE = 'P0002';
    END IF;

    -- customer
    UPDATE customer
    SET customer_name = p_customer->>'customer_name',
        no_telepon    = p_customer->>'no_telepon',
        update_at     = CURRENT_TIMESTAMP
    WHERE customer_id = v_customer_id
    RETURNING * INTO v_customer;

    -- service
    UPDATE service s
    SET user_id             = r.user_id,
        laptop_id           = r.laptop_id,
        jenis_service_id    = r.jenis_service_id,
        nomor_tiket_service = r.nomor_tiket_service,
        tanggal_masuk       = r.tanggal_masuk,
        laptop_sn           = r.laptop_sn,
        status_garansi      = r.status_garansi,
        status_service      = r.status_service,
        solusi              = r.solusi,
        kategori_kerusakan  = r.kategori_kerusakan,
        harga               = r.harga,
        estimasi_hari       = r.estimasi_hari,
        tanggal_selesai     = r.tanggal_selesai,
        update_at           = CURRENT_TIMESTAMP
    FROM jsonb_populate_record(NULL::service, p_service) r
    WHERE s.service_id = p_service_id
    RETURNING s.* INTO v_service;

    -- keluhan
    UPDATE keluhan k
    SET keluhan             = r.keluhan,
        jumlah_keluhan      = r.jumlah_keluhan,
        keluhan_lcd         = r.keluhan_lcd,
        keluhan_keyboard    = r.keluhan_keyboard,
        keluhan_charger     = r.keluhan_charger,
        keluhan_baterai     = r.keluhan_baterai,
        keluhan_engsel      = r.keluhan_engsel,
        keluhan_motherboard = r.keluhan_motherboard,
        keluhan_storage     = r.keluhan_storage,
        keluhan_memory      = r.keluhan_memory,
        keluhan_booting     = r.keluhan_booting,
        keluhan_kipas       = r.keluhan_kipas,
        keluhan_port        = r.keluhan_port,
        keluhan_software_os = r.keluhan_software_os,
        keluhan_password    = r.keluhan_password,
        keluhan_touchpad    = r.keluhan_touchpad,
        keluhan_speaker     = r.keluhan_speaker,
        keluhan_part        = r.keluhan_part,
        keluhan_kamera      = r.keluhan_kamera,
        keluhan_power       = r.keluhan_power,
        update_at           = CURRENT_TIMESTAMP
    FROM jsonb_populate_record(NULL::keluhan, p_keluhan) r
    WHERE k.service_id = p_service_id
    RETURNING k.* INTO v_keluhan;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Data keluhan untuk service ini tidak ditemukan' USING ERRCODE = 'P0002';
    END IF;

    RETURN jsonb_build_object(
        'customer', to_jsonb(v_customer),
        'service',  to_jsonb(v_service),
        'keluhan',  to_jsonb(v_keluhan)
    );
END;
$$;

-- Delete
create or replace function delete_data_service(p_service_id text)
returns jsonb
language plpgsql
as $$
declare
  v_customer_id text;
begin
  select customer_id into v_customer_id
  from service
  where service_id = p_service_id;

  if not found then
    raise exception 'Data service tidak ditemukan' using errcode = 'P0002';
  end if;

  delete from keluhan where service_id = p_service_id;
  delete from service where service_id = p_service_id;

  delete from customer
  where customer_id = v_customer_id
    and not exists (
      select 1 from service where customer_id = v_customer_id
    );

  return jsonb_build_object(
    'service_id', p_service_id,
    'customer_id', v_customer_id
  );
end;
$$;